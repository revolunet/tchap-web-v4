/*
 * Copyright 2022 New Vector Ltd
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
    IMediaEventContent,
    IPreparedMedia,
    prepEventContentAsMedia,
} from "matrix-react-sdk/src/customisations/models/IMediaEventContent";
import { MatrixClient } from "matrix-js-sdk/src/client";
import { ResizeMethod } from "matrix-js-sdk/src/@types/partials";

import { ContentScanner } from "../content-scanner/ContentScanner";

/**
 * A media object is a representation of a "source media" and an optional
 * "thumbnail media", derived from event contents or external sources.
 *
 * Routes all media through a content scanner.
 */
export class Media {
    constructor(public readonly prepared: IPreparedMedia) {}

    /**
     * True if the media appears to be encrypted. Actual file contents may vary.
     */
    public get isEncrypted(): boolean {
        return !!this.prepared.file;
    }

    /**
     * The MXC URI of the source media.
     */
    public get srcMxc(): string {
        return this.prepared.mxc;
    }

    /**
     * The MXC URI of the thumbnail media, if a thumbnail is recorded. Null/undefined
     * otherwise.
     */
    public get thumbnailMxc(): string | undefined | null {
        return this.prepared.thumbnail?.mxc;
    }

    /**
     * Whether or not a thumbnail is recorded for this media.
     */
    public get hasThumbnail(): boolean {
        return !!this.thumbnailMxc;
    }

    /**
     * The HTTP URL for the source media.
     */
    public get srcHttp(): string {
        return ContentScanner.instance.urlForMxc(this.srcMxc);
    }

    /**
     * The HTTP URL for the thumbnail media (without any specified width, height, etc). Null/undefined
     * if no thumbnail media recorded.
     */
    public get thumbnailHttp(): string | undefined | null {
        if (!this.hasThumbnail) return null;
        return ContentScanner.instance.urlForMxc(this.thumbnailMxc);
    }

    /**
     * Gets the HTTP URL for the thumbnail media with the requested characteristics, if a thumbnail
     * is recorded for this media. Returns null/undefined otherwise.
     * @param {number} width The desired width of the thumbnail.
     * @param {number} height The desired height of the thumbnail.
     * @param {"scale"|"crop"} mode The desired thumbnailing mode. Defaults to scale.
     * @returns {string} The HTTP URL which points to the thumbnail.
     */
    public getThumbnailHttp(width: number, height: number, mode: ResizeMethod = "scale"): string | null | undefined {
        if (!this.hasThumbnail) return null;
        return ContentScanner.instance.urlForMxc(this.thumbnailMxc, width, height, mode);
    }

    /**
     * Gets the HTTP URL for a thumbnail of the source media with the requested characteristics.
     * @param {number} width The desired width of the thumbnail.
     * @param {number} height The desired height of the thumbnail.
     * @param {"scale"|"crop"} mode The desired thumbnailing mode. Defaults to scale.
     * @returns {string} The HTTP URL which points to the thumbnail.
     */
    public getThumbnailOfSourceHttp(width: number, height: number, mode: ResizeMethod = "scale"): string {
        return ContentScanner.instance.urlForMxc(this.srcMxc, width, height, mode);
    }

    /**
     * Creates a square thumbnail of the media. If the media has a thumbnail recorded, that MXC will
     * be used, otherwise the source media will be used.
     * @param {number} dim The desired width and height.
     * @returns {string} An HTTP URL for the thumbnail.
     */
    public getSquareThumbnailHttp(dim: number): string {
        if (this.hasThumbnail) {
            return this.getThumbnailHttp(dim, dim, "crop");
        }
        return this.getThumbnailOfSourceHttp(dim, dim, "crop");
    }

    /**
     * Downloads the source media.
     * @returns {Promise<Response>} Resolves to the server's response for chaining.
     */
    public downloadSource(): Promise<Response> {
        return ContentScanner.instance.download(this.srcMxc, this.prepared.file);
    }

    /**
     * Hardened Element Web specific. Scans the source media with the content scanner.
     * @returns {Promise<boolean>} Resolves to true if the media is safe.
     */
    public scanSource(): Promise<boolean> {
        return ContentScanner.instance.scan(this.srcMxc, this.prepared.file);
    }

    /**
     * Hardened Element Web specific. Scans the thumbnail media with the content scanner.
     * If there is no thumbnail media, this returns true.
     * @returns {Promise<boolean>} Resolves to true if the media is safe.
     */
    public async scanThumbnail(): Promise<boolean> {
        if (!this.hasThumbnail) return true;
        return ContentScanner.instance.scan(this.thumbnailMxc, this.prepared.thumbnail.file);
    }
}

/**
 * Creates a media object from event content.
 * @param {IMediaEventContent} content The event content.
 * @param {MatrixClient} client? Optional client to use.
 * @returns {Media} The media object.
 */
export function mediaFromContent(content: IMediaEventContent, client?: MatrixClient): Media {
    return new Media(prepEventContentAsMedia(content));
}

/**
 * Creates a media object from an MXC URI.
 * @param {string} mxc The MXC URI.
 * @param {MatrixClient} client? Optional client to use.
 * @returns {Media} The media object.
 */
export function mediaFromMxc(mxc: string, client?: MatrixClient): Media {
    return mediaFromContent({ url: mxc }, client);
}
