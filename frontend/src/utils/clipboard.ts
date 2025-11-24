export const copyToClipboard = async (
  text: string,
  onSuccess?: (message: string) => void,
  onError?: (message: string) => void
): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text);
    onSuccess?.('Copied to clipboard!');
  } catch (err) {
    onError?.('Failed to copy to clipboard');
  }
};
