const getSupabaseClient = require('../config/supabase');
const AppError = require('../utils/appError');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const uploadToSupabase = async (file) => {
  const supabase = getSupabaseClient();
  const filePath = `files/${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;

  const { error } = await supabase.storage
    .from('LinkVault')
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) {
    throw new AppError('Failed to upload file!', 500);
  }

  return filePath; // store THIS in DB
};

module.exports = uploadToSupabase;
