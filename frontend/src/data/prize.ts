export interface Prize {
  prizeId: string;
  name: string;
  stock: number;
  cost: number;
  description: string;
  /**
   * Image source is a url (including base64-encoded data url, https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URLs)
   * Note: image is scaled to cover the space
   */
  image: string;
}
