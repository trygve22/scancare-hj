export const mockReviewsByProduct = {
  'Moisturizing Cream': [
    {
      userName: 'Anna, 27',
      rating: 5,
      text: 'Min hud føles roligere og gennemfugtet hele dagen. Den er tung, men uden at fedte – perfekt til min tørre hud.',
    },
    {
      userName: 'Mikkel, 33',
      rating: 4,
      text: 'Bruger den især om vinteren, hvor min hud ellers sprækker. Trækker langsomt ind, men virker virkelig beskyttende.',
    },
  ],
};

export function getMockReviewsForProduct(name) {
  return mockReviewsByProduct[name] || [];
}
