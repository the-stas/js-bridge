( function () {
    'use strict';

    const container = document.getElementById( 'root' );
    const contentType = 'image/png';

    init();

    function init() {
        expose();
    }

    function expose() {
        window.dispatchImageLoading = dispatchImageLoading;
    }

    function dispatchImageLoading( imagesBase64 ) {
        const event = new CustomEvent( 'webViewImageLoaded', {
                detail: {
                    images: imagesBase64,
                },
            },
        );

        window.dispatchEvent( event );
    }

    /**
     * https://stackoverflow.com/a/16245768/
     */
    const b64toBlob = ( b64Data, contentType = '', sliceSize = 512 ) => {
        const byteCharacters = atob( b64Data );
        const byteArrays = [];

        for ( let offset = 0; offset < byteCharacters.length; offset += sliceSize ) {
            const slice = byteCharacters.slice( offset, offset + sliceSize );

            const byteNumbers = new Array( slice.length );
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt( i );
            }

            const byteArray = new Uint8Array( byteNumbers );
            byteArrays.push( byteArray );
        }

        return new Blob( byteArrays, { type: contentType } );
    };

    window.addEventListener( 'webViewImageLoaded', function ( event ) {
        const data = event.detail;
        const imagesBase64 = data.images;
        const urls = [];

        for ( const imageBase64 of imagesBase64 ) {
            const blob = b64toBlob( imageBase64, contentType );
            const blobUrl = URL.createObjectURL( blob );

            urls.push( blobUrl );
            // URL.revokeObjectURL( blobUrl );
        }

        container.insertAdjacentHTML( 'afterbegin', createMarkup( urls ) );
    } );

    function createMarkup( blobUrls ) {
        return (
            `<div style="border: 2px solid darkslateblue;padding: 20px;max-width: 360px;margin: 0 auto 20px;">
                <h3 style="margin-bottom: 20px;">
                    Yay! it works!
                </h3>
                <p style="margin-bottom: 40px;">
                    Images from ios native camera:
                </p>
                <ol>
                    ${
                        blobUrls.map( ( blobUrl ) => createListItem( blobUrl ) )
                    }
                </ol>
                <br>
            </div>`
        );
    }

    function getFileFromBlob( blob, fileName ) {
        return new File( [ blob ], fileName, {
            type: 'image/png',
        } );
    }

    function downloadBlob( url, filename ) {
        const a = document.createElement( 'a' );

        a.href = url;
        a.download = filename || 'download';
        a.textContent = `Download ${ filename }`;
        a.style.margin = '20px';

        const clickHandler = () => {
            setTimeout( () => {
                URL.revokeObjectURL( url );
                removeEventListener( 'click', clickHandler );
            }, 150 );
        };

        a.addEventListener( 'click', clickHandler, false );

        return a;
    }

    function createListItem( blobUrl ) {
        return `
            <li style="padding: 20px;">
                <img src="${ blobUrl }" style="max-width: 320px; max-height: 600px;" alt="">
            </li>
        `;
    }
}() );
