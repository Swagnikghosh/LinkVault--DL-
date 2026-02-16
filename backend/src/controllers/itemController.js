const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const validator = require('validator');

const getSupabaseClient = require('../config/supabase');
const Item = require('../models/itemModel');
const uploadToSupabase = require('../utils/uploadSupabase');
const AppError = require('../utils/appError');
const { constants } = require('../utils/constants');

// ---------- helpers ----------
const signedUrlFor = async (path, seconds = 600) => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.storage.from('LinkVault').createSignedUrl(path, seconds);
  if (error) throw new AppError('Could not generate download link', 500);
  return data.signedUrl;
};

const webShareUrl = (doc) => {
  const base = doc.isText === 'false' ? process.env.FILE_DOWNLOAD_LINK : process.env.TEXT_DOWNLOAD_LINK;
  let url = `${base.replace('<PORT>', process.env.PORT)}${doc._id}`;
  if (doc.password) url += '?isProtected=true&password=<PASSWORD>';
  return url;
};

const normalizeLinkName = (value) => {
  if (value === undefined || value === null) return undefined;
  const trimmed = String(value).trim();
  if (!trimmed) return '';
  return trimmed.slice(0, 80);
};

const normalizeAllowedEmail = (value, next) => {
  if (value === undefined || value === null) return undefined;
  const email = String(value).trim().toLowerCase();
  if (!email) return undefined;
  if (!validator.isEmail(email)) {
    next(new AppError('Allowed user email must be valid', constants.VALIDATION_ERROR));
    return null;
  }
  return email;
};

const futureDateOrError = (value, next) => {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime()) || parsed <= new Date()) {
    next(new AppError('Expiry must be in the future', constants.VALIDATION_ERROR));
    return null;
  }
  return parsed;
};

const viewLimitsFrom = (maxViewsRaw) => {
  const maxViews = maxViewsRaw === null || maxViewsRaw === '' ? null : Number(maxViewsRaw);
  if (maxViews !== null && (!Number.isFinite(maxViews) || maxViews < 1)) {
    throw new AppError('maxViews must be at least 1', constants.VALIDATION_ERROR);
  }
  return {
    maxViews,
    viewsLeft: maxViews,
  };
};

const presentForDashboard = (doc) => ({
  id: doc._id,
  linkName: doc.linkName || `${doc.isText === 'false' ? 'File' : 'Text'} link ${doc._id.toString().slice(-6)}`,
  type: doc.isText === 'false' ? 'file' : 'text',
  createdAt: doc.createdAt,
  expiresAt: doc.expiresAt,
  maxViews: doc.maxViews,
  viewsLeft: doc.viewsLeft,
  isProtected: Boolean(doc.password),
  allowedViewerEmail: doc.allowedViewerEmail || null,
  shareUrl: webShareUrl(doc),
});

// ---------- controllers ----------
exports.createText = asyncHandler(async (req, res, next) => {
  const allowedViewerEmail = normalizeAllowedEmail(req.body.allowedViewerEmail, next);
  if (allowedViewerEmail === null) return;

  const payload = {
    item: req.body.item,
    expiresAt: req.body.expiresAt,
    password: req.body.password,
    owner: req.user._id,
    linkName: normalizeLinkName(req.body.linkName),
    allowedViewerEmail,
  };

  const maxViews = Number(req.body.maxViews);
  if (maxViews > 0) {
    payload.maxViews = maxViews;
    payload.viewsLeft = maxViews;
  }

  const doc = await Item.create(payload);
  const url = webShareUrl(doc);

  res.status(201).json({ status: 'success', data: { url } });
});

exports.createFile = asyncHandler(async (req, res, next) => {
  if (!req.file) return next(new AppError('No file uploaded', 400));

  const allowedViewerEmail = normalizeAllowedEmail(req.body.allowedViewerEmail, next);
  if (allowedViewerEmail === null) return;

  const uploadedPath = await uploadToSupabase(req.file);

  let signedDuration = 10 * 60;
  if (req.body.expiresAt) {
    const target = new Date(req.body.expiresAt);
    if (!Number.isNaN(target.getTime())) {
      const diff = Math.floor((target - Date.now()) / 1000);
      if (diff > 0) signedDuration = diff;
    }
  }

  const signedUrl = await signedUrlFor(uploadedPath, signedDuration);

  const payload = {
    item: uploadedPath,
    expiresAt: req.body.expiresAt,
    url: signedUrl,
    isText: false,
    owner: req.user._id,
    linkName: normalizeLinkName(req.body.linkName),
    allowedViewerEmail,
  };

  const maxViews = Number(req.body.maxViews);
  if (maxViews) {
    payload.maxViews = maxViews;
    payload.viewsLeft = maxViews;
  }

  const doc = await Item.create(payload);
  const localUrl = webShareUrl(doc);

  res.status(201).json({ status: 'success', data: { localUrl } });
});

exports.getText = asyncHandler(async (req, res) => {
  res.status(200).json({ status: 'success', data: { text: req.doc.item } });
});

exports.getFile = asyncHandler(async (req, res) => {
  res.status(200).json({ status: 'success', data: { downloadUrl: req.doc.url } });
});

exports.getMyLinks = asyncHandler(async (req, res) => {
  const docs = await Item.find({ owner: req.user._id })
    .select('+createdAt +expiresAt +password +allowedViewerEmail')
    .sort({ _id: -1 });

  res.status(200).json({
    status: 'success',
    data: { links: docs.map(presentForDashboard) },
  });
});

exports.updateMyLink = asyncHandler(async (req, res, next) => {
  const doc = await Item.findOne({ _id: req.params.id, owner: req.user._id }).select(
    '+password +createdAt +expiresAt +allowedViewerEmail',
  );
  if (!doc) return next(new AppError('Link not found', constants.NOT_FOUND));

  const updates = {};

  if (Object.prototype.hasOwnProperty.call(req.body, 'expiresAt')) {
    const nextExpiry = futureDateOrError(req.body.expiresAt, next);
    if (nextExpiry === null) return;
    updates.expiresAt = nextExpiry;
  }

  if (Object.prototype.hasOwnProperty.call(req.body, 'maxViews')) {
    const limits = viewLimitsFrom(req.body.maxViews);
    updates.maxViews = limits.maxViews;
    updates.viewsLeft = limits.viewsLeft;
  }

  if (Object.prototype.hasOwnProperty.call(req.body, 'password')) {
    const trimmed = req.body.password ? String(req.body.password).trim() : '';
    updates.password = trimmed || undefined;
  }

  if (Object.prototype.hasOwnProperty.call(req.body, 'allowedViewerEmail')) {
    const nextEmail = normalizeAllowedEmail(req.body.allowedViewerEmail, next);
    if (nextEmail === null) return;
    updates.allowedViewerEmail = nextEmail || null;
  }

  if (Object.prototype.hasOwnProperty.call(req.body, 'linkName')) {
    updates.linkName = normalizeLinkName(req.body.linkName);
  }

  Object.assign(doc, updates);
  await doc.save();

  if (doc.isText === 'false' && updates.expiresAt) {
    const secondsRemaining = Math.max(60, Math.floor((new Date(doc.expiresAt) - Date.now()) / 1000));
    doc.url = await signedUrlFor(doc.item, secondsRemaining);
    await doc.save();
  }

  res.status(200).json({ status: 'success', data: { link: presentForDashboard(doc) } });
});

exports.deleteMyLink = asyncHandler(async (req, res, next) => {
  const doc = await Item.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
  if (!doc) return next(new AppError('Link not found', constants.NOT_FOUND));

  res.status(200).json({ status: 'success', data: { id: req.params.id } });
});
