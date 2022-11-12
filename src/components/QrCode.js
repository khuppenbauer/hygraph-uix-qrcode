import React, { useState, useEffect } from 'react';
import { Wrapper, useFormSidebarExtension } from '@graphcms/uix-react-sdk';
import QRCode from 'qrcode';

const QrCodePreview = () => {
  const {
    extension,
    form: { getFieldState, subscribeToFieldState },
  } = useFormSidebarExtension();

  const [slug, setSlug] = useState('');
  const [qrCode, setQrCode] = useState({});
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

  const rgb2hex = (rgba) => {
    const { r, g, b } = rgba;
    const rHex = r.toString(16).padStart(2, '0');
    const gHex = g.toString(16).padStart(2, '0');
    const bHex = b.toString(16).padStart(2, '0');
    return `#${rHex}${gHex}${bHex}`;
  };

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
    const lightColor = qrCode.lightColor || { rgba: { r: 255, g: 255, b: 255 } };
    const darkColor = qrCode.darkColor || { rgba: { r: 0, g: 0, b: 0 } };
    const lightColorHex = rgb2hex(lightColor.rgba);
    const darkColorHex = rgb2hex(darkColor.rgba);
    QRCode.toDataURL(`${qrCodeDomain}/${slug}`, {
      width: 250,
      color: {
        dark: darkColorHex || '#000000',
        light: lightColorHex || '#ffffff',
      },
    }, (err, dataUrl) => {
      const img = document.getElementById('qrCodeImage');
      img.src = dataUrl;
    });
  }

  return (
    <img id="qrCodeImage" width="250" height="250" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" />
  );
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
