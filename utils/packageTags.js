export const extractPackageTags = (payload) => {
  const packages = payload?.data || payload || [];
  const uniqueTags = new Set();

  packages.forEach((pkg) => {
    pkg?.packageTags?.forEach((tag) => {
      if (typeof tag === 'string' && tag.trim()) {
        uniqueTags.add(tag.trim());
      }
    });
  });

  return Array.from(uniqueTags);
};