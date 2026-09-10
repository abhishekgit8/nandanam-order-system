import { supabase } from './supabase';

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

let menuCache = null;
let cacheTimestamp = 0;

export async function getCachedMenu() {
  const now = Date.now();
  if (menuCache && now - cacheTimestamp < CACHE_TTL) {
    return menuCache;
  }

  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('available', true)
    .order('category')
    .order('name');

  if (error) throw error;

  menuCache = data;
  cacheTimestamp = now;
  return menuCache;
}

export async function getAllMenuItems() {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .order('category')
    .order('name');

  if (error) throw error;
  return data;
}

export function invalidateMenuCache() {
  menuCache = null;
  cacheTimestamp = 0;
}
