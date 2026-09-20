export function primaryImageUrl(
  images?: Array<{ image_url: string | null; is_primary: boolean }> | null,
) {
  return images?.find((image) => image.is_primary)?.image_url || images?.[0]?.image_url || null;
}
