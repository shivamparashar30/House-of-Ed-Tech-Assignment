export function avatarUrl(seed: string | null | undefined): string {
  const value = encodeURIComponent(seed && seed.length > 0 ? seed : 'BingeBox Guest');
  return `https://api.dicebear.com/10.x/thumbs/png?seed=${value}`;
}
