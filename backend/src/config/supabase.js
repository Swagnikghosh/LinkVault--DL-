const { createClient } = require('@supabase/supabase-js');
const AppError = require('../utils/appError');
const { constants } = require('../utils/constants');

let cachedClient = null;

const getSupabaseClient = () => {
  if (cachedClient) return cachedClient;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new AppError(
      'File storage is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
      constants.SERVER_ERROR,
    );
  }

  cachedClient = createClient(url, key);
  return cachedClient;
};

module.exports = getSupabaseClient;
