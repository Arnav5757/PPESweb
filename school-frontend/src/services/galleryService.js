import { request } from "./api";

export const galleryService = {
  getGallery: async () => {
    return request("/api/gallery");
  },

  createGalleryItem: async (photoData) => {
    return request("/api/gallery", {
      method: "POST",
      body: JSON.stringify(photoData)
    });
  },

  deleteGalleryItem: async (id) => {
    return request(`/api/gallery/${id}`, {
      method: "DELETE"
    });
  }
};
