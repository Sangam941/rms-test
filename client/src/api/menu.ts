// Menu API functions for add, edit, update, delete using exios (local axios instance)

import api from './axios';

// Add menu item
export async function addMenuItem(formData: FormData): Promise<any> {
  const response = await api.post('/menu/admin', formData);
  return response.data;
}

// Update/Edit menu item by ID
export async function updateMenuItem(id: string, formData: FormData): Promise<any> {
  const response = await api.put(`/menu/admin/${id}`, formData);
  return response.data;
}

// Delete menu item by ID
export async function deleteMenuItem(id: string): Promise<void> {
  await api.delete(`/menu/admin/${id}`);
}

// Optionally, fetch all menu items
export async function fetchMenuItems(): Promise<any[]> {
  const response = await api.get('/menu');
  return response.data.menu;
}

// Update menu item availability (toggle isAvailable by ID)
export async function updateMenuItemAvailability(id: string, isAvailable: boolean): Promise<any> {
  const response = await api.patch(`/menu/admin/${id}/availability`, { isAvailable });
  return response.data;
}

// Toggle the "isSpecial" flag for a menu item by ID
export async function toggleSpecial(id: string, isSpecial: boolean): Promise<any> {
  const response = await api.patch(`/menu/admin/${id}/special`, { isSpecial });
  return response.data;
}




