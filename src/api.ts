import { ethers } from "ethers";
import { abi, contractAddress } from "./utils/contract";

/**
 * Fetch all token ids for an address.
 *
 * Tokens must be fetched one-at-a-time, due to how ERC721 contracts currently work.
 * We return all tokens that were fetched successfully, and ignore fetching errors.
 */
export async function fetchAllTokenIds(
  contract: ethers.Contract,
  address: string
) {
  const balance = await contract.balanceOf(address);

  const tokens: number[] = [];

  for (let index = 0; index < balance; index++) {
    try {
      const tokenId = await contract.tokenOfOwnerByIndex(address, index);

      tokens.push(+tokenId);
    } catch {
      break;
    }
  }

  return tokens;
}

/**
 * Get all tokens for the connected wallet
 *
 * Note: The API calls may fail, so make sure to handle any errors
 */
export async function getTokenIds(
  provider: ethers.providers.Web3Provider
): Promise<number[]> {
  const signer = provider.getSigner();

  const address = await signer.getAddress();

  const contract = new ethers.Contract(contractAddress, abi, provider);

  const tokenIds = await fetchAllTokenIds(contract, address);

  return tokenIds;
}

/**
 * Get all colors for a given `tokenId`
 *
 * Note: The API calls may fail, so make sure to handle any errors
 */
export async function getColors(
  provider: ethers.providers.Web3Provider,
  tokenId: number
): Promise<string[]> {
  const contract = new ethers.Contract(contractAddress, abi, provider);

  const colors = await contract.getColors(tokenId);

  return colors.split(" ");
}

/**
 * Connect to the user's wallet.
 *
 * Note: This approach may be MetaMask specific.
 *
 * @param ethereum The global web3 provider object
 */
export async function getProvider(ethereum: any) {
  await ethereum.enable();

  return new ethers.providers.Web3Provider(ethereum);
}

export function getOpenSeaUrl(index: number) {
  return `https://opensea.io/assets/${contractAddress}/${index}`;
}
