
import Accessor from "esri/core/Accessor";
import {
  declared,
  property,
  subclass,
} from "esri/core/accessorSupport/decorators";
import {
  create as createPromise,
  eachAlways,
  reject as rejectPromise,
} from "esri/core/promiseUtils";

interface BlobZIPEntry {
  name: string;
  url: string;
  blob: Blob;
}

interface ZIPEntry {
  directory: boolean;
  filename: string;
  getData: (writer: any, onFinished: (_: any) => void) => void;
}

const ZIP_PROGRESS_FACTOR = 0.5;

@subclass("app.draw.support.GlTFImport")
export default class GlTFImport extends declared(Accessor) {

  @property()
  public progress = 0;

  @property()
  public task: string;

  public readonly blobUrl: IPromise<string>;

  private zip = (window as any).zip;

  constructor(public url: string) {
    super();

    this._reportProgress("start", 0);
    this.blobUrl = this
      ._downloadAndExtractZip(this.url)
      .then((entries) => this._zipEntriesToBlob(entries))
      .then((blobEntries) => this._combineToSingleBlob(blobEntries))
      .then((gltfBlob) => gltfBlob.url);
  }

  private _downloadAndExtractZip(url: string): IPromise<ZIPEntry[]> {
    return createPromise(((resolve: (_: ZIPEntry[]) => void, reject: (error?: any) => void) => {
      const reader = new this.zip.HttpProgressReader(url, {
        onProgress: this._reportDownloadProgress.bind(this),
      });
      this.zip.createReader(
          reader,
          (zipReader: any) => {
            zipReader.getEntries(resolve);
          },
          reject,
      );
    }) as any);
  }

  private _zipEntriesToBlob(entries: ZIPEntry[]): IPromise<BlobZIPEntry[]> {

    entries = entries.filter((entry) => !entry.directory);

    // const progress = (currentIndex, totalIndex)

    let completedBlobs = 0;

    const promises = entries.map(
      (entry) => this
        ._saveEntryToBlob(entry)
        .then((blob) => {
          this._reportUnzipProgress(entries.length, ++completedBlobs);
          return blob;
        }),
    );

    return eachAlways(promises).then((results: __esri.EachAlwaysResult[]) => {
      return results.map((result) => result.value);
    });
  }

  private _saveEntryToBlob(entry: ZIPEntry): IPromise<BlobZIPEntry> {
    return createPromise(((resolve: (_: BlobZIPEntry) => void) => {
      entry.getData(
          new this.zip.BlobWriter("text/plain"),
          (data: any) => {
              const url = window.URL.createObjectURL(data);
              resolve({
                name: entry.filename,
                url,
                blob: data,
              });
          },
      );
    }) as any);
  }

  private _combineToSingleBlob(entries: BlobZIPEntry[]): IPromise<BlobZIPEntry> {

    const rootEntry = entries.reduce(
      (previous, entry) => !previous && entry.name.match(/\.gltf$/) ? entry : previous,
      undefined,
    );

    if (!rootEntry) {
      return rejectPromise("Can not find a .gltf file in ZIP archive");
    }
    const assets = entries.reduce((previous, entry) => {
        previous[entry.name] = entry.url;
        return previous;
      },
      {},
    );
    const reader = new FileReader();

    return createPromise(((resolve: (_: BlobZIPEntry) => void, reject: (error?: any) => void) => {

      reader.onload = () => {
        try {
          const gltfJson = JSON.parse(reader.result as string);

          // Replace original buffers and images by blob URLs
          if (gltfJson.hasOwnProperty("buffers")) {
            gltfJson.buffers.forEach((buffer: any) => buffer.uri = assets[buffer.uri]);
          }

          if (gltfJson.hasOwnProperty("images")) {
            gltfJson.images.forEach((image: any) => image.uri = assets[image.uri]);
          }

          const gltfContent = JSON.stringify(gltfJson, null, 2);
          const gltfBlob = new Blob([gltfContent], { type: "text/plain" });
          const gltfUrl = window.URL.createObjectURL(gltfBlob);
          resolve({
            name: rootEntry.name,
            url: gltfUrl,
            blob: gltfBlob,
          });
        } catch (e) {
          reject(e);
        }
      };

      // Read initial blob
      reader.readAsText(rootEntry.blob);
    }) as any);
  }

  private _reportDownloadProgress(event: any) {
    const value = (event.loaded / event.total) * (1 - ZIP_PROGRESS_FACTOR);
    this._reportProgress("download", value);
  }

  private _reportUnzipProgress(total: number, completed: number) {
    const value = ZIP_PROGRESS_FACTOR + completed / total * ZIP_PROGRESS_FACTOR;
    this._reportProgress("unzip", value);
  }

  private _reportProgress(task: string, value: number) {
    this.task = task;
    value = Math.floor(100 * value);
    if (value >= this.progress) {
      this.progress = value;
    }
  }

}
