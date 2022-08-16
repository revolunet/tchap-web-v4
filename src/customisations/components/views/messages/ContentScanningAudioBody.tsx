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

import React from "react";
import { IBodyProps } from "matrix-react-sdk/src/components/views/messages/IBodyProps";

import { Media } from "../../../ContentScanningMedia";
import ContentScanningFileBody from "./ContentScanningFileBody";
import OriginalAudioBody from "../../../../components/views/messages/OriginalAudioBody";
import { ContentScanningStatus } from "../../../../components/views/elements/ContentScanningStatus";

interface State {
    isScanning: boolean;
    isSafe: boolean;
}

/**
 * Content scanning component, that wraps MAudioBody from react-sdk.
 * On success it displays the original component (of which a copy exists in this repo).
 */
export default class ContentScanningAudioBody extends React.PureComponent<IBodyProps, State> {
    public static defaultProps = {
        showGenericPlaceholder: true,
    };

    public constructor(props: IBodyProps) {
        super(props);
        this.state = {
            isScanning: true,
            isSafe: false,
        };

        Promise.all([
            this.media.scanSource(),
            this.media.scanThumbnail(),
        ]).then(async ([ok1, ok2]) => {
            const isSafe = ok1 && ok2;
            this.setState({
                isScanning: false,
                isSafe,
            });
        });
    }

    public render() {
        if (this.state.isScanning || !this.state.isSafe) {
            return <ContentScanningFileBody {...this.props} />;
        }

        return <div>
            <OriginalAudioBody {...this.props} />
            <ContentScanningStatus status="done" />
        </div>;
    }

    private get media(): Media {
        return this.props.mediaEventHelper.media as any as Media;
    }
}
