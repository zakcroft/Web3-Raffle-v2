import { NFTStorage, File } from "nft.storage";
import { filesFromPath } from "files-from-path";
import path from 'path'

const NFT_STORAGE_KEY = process.env.NFT_STORAGE || "";

export async function storeNFTDir (directoryPath = './nft-resources') {

  const files = await filesFromPath(directoryPath, {
    pathPrefix: path.resolve(directoryPath),
  })

  const storage = new NFTStorage({ token: NFT_STORAGE_KEY })

  for await (let file of files) {
    console.log('file')
    console.log(file)
    const response = await storage.store({
      image: new File(
        [
          file.stream()
        ],
        file.name,
        { type: 'image/jpg' }
      ),
      name: file.name,
      description: `An adorable ${file.name}`,
      attributes: [{ trait_type: "cuteness", value: 100 }],
    })
    console.log(response);
  }
}

