import React, { useState, useEffect } from 'react';
import { Wrapper, useFormSidebarExtension } from '@graphcms/uix-react-sdk';
import { createQrCode, rgb2hex } from '../services/createQrCode';
import { uploadQrCode, conncectQrCode } from '../services/processQrCode';
import './qrcode.css';

const canvasWidth = 600;

const download = (slug, text, darkColorHex, lightColorHex, width, frame, logo) => {
  const img = createQrCode(text, darkColorHex, lightColorHex, width, frame, logo);
  const link = document.createElement('a');
  link.download = `${slug}.png`;
  link.href = img.toDataURL();
  document.body.appendChild(link);
  link.click();
};

const upload = async (
  slug, pageId, text, darkColorHex, lightColorHex, width, frame, logo, qrCodeId, imageId, setReadyState,
) => {
  setReadyState(true);
  const qrCode = createQrCode(text, darkColorHex, lightColorHex, width, frame, logo);
  const asset = await uploadQrCode(slug, qrCode);
  if (asset) {
    await conncectQrCode(asset.id, lightColorHex, darkColorHex, pageId, qrCodeId, imageId);
    setReadyState(false);
  }
};

const QrCodePreview = () => {
  const {
    extension,
    entry: { id: pageId },
    form: { getFieldState, subscribeToFieldState },
  } = useFormSidebarExtension();

  const [slug, setSlug] = useState('');
  const [qrCode, setQrCode] = useState({});
  const [readyState, setReadyState] = useState(false);
  const { sidebarConfig, config } = extension;

  const { QRCODE_DOMAIN: qrCodeDomain } = config;

  useEffect(() => {
    getFieldState('slug').then((state) => {
      setSlug(state.value);
    });
    getFieldState('qrCode').then((state) => {
      setQrCode(state.value);
    });
  }, [getFieldState, setSlug, setQrCode]);

  useEffect(() => {
    const unsubscribe = async () => {
      await subscribeToFieldState(
        sidebarConfig.SLUG_FIELD,
        (state) => {
          setSlug(state.value);
        },
        { value: true },
      );
    };
    return () => unsubscribe();
  }, [subscribeToFieldState, sidebarConfig.SLUG_FIELD]);

  useEffect(() => {
    const unsubscribe = async () => {
      await subscribeToFieldState(
        sidebarConfig.QRCODE_COMPONENT,
        (state) => {
          setQrCode(state.value);
        },
        { value: true },
      );
    };
    return () => unsubscribe();
  }, [subscribeToFieldState, sidebarConfig.QRCODE_COMPONENT]);

  if (slug && qrCode) {
    const text = qrCode.alternativeUrl || `${qrCodeDomain}/${slug}`;
    const lightColor = qrCode.lightColor || { rgba: { r: 255, g: 255, b: 255 } };
    const darkColor = qrCode.darkColor || { rgba: { r: 0, g: 0, b: 0 } };
    const lightColorHex = rgb2hex(lightColor.rgba);
    const darkColorHex = rgb2hex(darkColor.rgba);
    const imageId = qrCode.image?.id || null;
    const { frame, logo, id: qrCodeId } = qrCode;
    const canvas = createQrCode(text, darkColorHex, lightColorHex, canvasWidth, frame, logo);
    const width = qrCode.width || canvasWidth;
    const className = readyState === true ? 'button button--loading' : 'button';
    return (
      <>
        <img id="qrCodeImage" width="200" src={canvas.toDataURL()} />
        <button
          onClick={() => download(slug, text, darkColorHex, lightColorHex, width, frame, logo)}
        >
          Download
        </button>
        <button
          className={className}
          onClick={() => upload(
            slug, pageId, text, darkColorHex, lightColorHex, width, frame, logo, qrCodeId, imageId, setReadyState,
          )}
        >
          <span class="button__text">Upload</span>
        </button>
      </>
    );
  }
  return null;
};

const declaration = {
  extensionType: 'formSidebar',
  name: 'QrCode Preview',
  description: 'Preview QrCode',
  config: {
    QRCODE_DOMAIN: {
      type: 'string',
      displayName: 'QrCode Domain',
      required: true,
    },
  },
  sidebarConfig: {
    SLUG_FIELD: {
      type: 'string',
      displayName: 'Slug Field',
      required: true,
    },
    QRCODE_COMPONENT: {
      type: 'string',
      displayName: 'QrCode Component',
      required: true,
    },
  },
};

const QrCode = () => (
  <Wrapper declaration={declaration}>
    <QrCodePreview />
  </Wrapper>
);

export default QrCode;
