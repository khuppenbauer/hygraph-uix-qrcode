import QRCode from 'qrcode';
import { createCanvas } from 'canvas';

const fontSizes = [
  46, 48, 44, 42, 40, 38, 36, 34, 32, 30, 28, 26, 24, 22, 20, 18, 16, 14, 12, 10, 8, 6, 4, 2, 0,
];
const margin = 50;
const logoMargin = 20;

export const rgb2hex = (rgba) => {
  const { r, g, b } = rgba;
  const rHex = r.toString(16).padStart(2, '0');
  const gHex = g.toString(16).padStart(2, '0');
  const bHex = b.toString(16).padStart(2, '0');
  return `#${rHex}${gHex}${bHex}`;
};

const parseText = (width, text) => {
  const textItems = text.split('\n');
  if (textItems.length > 0) {
    const canvas = createCanvas(width, width);
    const ctx = canvas.getContext('2d');
    return textItems.map((textItem) => {
      let textDimensions;
      let size;
      let i = 0;
      do {
        size = fontSizes[i];
        ctx.font = `${size}px sans-serif`;
        textDimensions = ctx.measureText(textItem);
        i += 1;
      } while (textDimensions.width >= width);
      return {
        text: textItem,
        size,
      };
    });
  }
  return null;
};

const calculateHeight = (width, text) => {
  const textItems = parseText(width, text);
  if (textItems) {
    const height = textItems.reduce(
      (previousValue, currentValue) => previousValue + currentValue.size,
      0,
    );
    return width + margin * 3 + height + height / 3;
  }
  return width;
};

const addText = (ctx, framePosition, width, innerSize, frame, frameColorHex) => {
  let top = framePosition === 'top' ? margin : width;
  const textItems = parseText(innerSize, frame.text);
  textItems.forEach((textItem) => {
    const { text, size } = textItem;
    ctx.fillStyle = frameColorHex;
    ctx.textBaseline = 'top';
    ctx.font = `${size}px sans-serif`;
    const left = (width - ctx.measureText(text).width) / 2;
    ctx.fillText(text, left, top);
    top += size + size / 3;
  });
};

const addQrCode = (ctx, text, darkColorHex, lightColorHex, innerSize, frame, width, height, logo) => {
  const qrCodeCanvas = createCanvas(innerSize, innerSize);
  QRCode.toCanvas(
    qrCodeCanvas,
    text,
    {
      width: innerSize,
      color: {
        dark: darkColorHex || '#000000',
        light: lightColorHex || '#ffffff',
      },
    },
  );

  let innerTop = frame ? margin : 0;
  const innerLeft = frame ? margin : 0;
  if (frame && frame.position === 'top') {
    innerTop = height - width + margin;
  }
  ctx.drawImage(qrCodeCanvas, innerLeft, innerTop);

  if (logo && logo.logo) {
    const { logo: { url } } = logo;
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = url;
    const maxWidth = innerSize - 80;
    let logoWidth = img.width;
    let logoHeight = img.height;
    if (logoWidth > maxWidth || logoHeight > maxWidth) {
      const ratio = 1 / (img.width / img.height);
      if (logoWidth > logoHeight) {
        logoWidth = maxWidth - 80;
        logoHeight = ratio * logoWidth;
      } else {
        logoHeight = maxWidth - 80;
        logoWidth = ratio * logoHeight;
      }
    }
    const logoTop = innerTop + innerSize / 2 - logoHeight / 2;
    const logoLeft = innerLeft + innerSize / 2 - logoWidth / 2;
    ctx.fillStyle = lightColorHex || '#ffffff';
    ctx.fillRect(
      logoLeft - logoMargin,
      logoTop - logoMargin,
      logoWidth + logoMargin * 2,
      logoHeight + logoMargin * 2,
    );
    ctx.drawImage(img, logoLeft, logoTop, logoWidth, logoHeight);
  }
};

const addRoundRect = (ctx, frameLeft, frameTop, frameWidth, frameHeight, frameBackgroundColor, radius) => {
  ctx.beginPath();
  ctx.moveTo(
    frameLeft + radius,
    frameTop,
  );
  ctx.lineTo(
    frameLeft + frameWidth - radius,
    frameTop,
  );
  ctx.quadraticCurveTo(
    frameLeft + frameWidth,
    frameTop,
    frameLeft + frameWidth,
    frameTop + radius,
  );
  ctx.lineTo(
    frameLeft + frameWidth,
    frameTop + frameHeight - radius,
  );
  ctx.quadraticCurveTo(
    frameLeft + frameWidth,
    frameTop + frameHeight,
    frameLeft + frameWidth - radius,
    frameTop + frameHeight,
  );
  ctx.lineTo(
    frameLeft + radius,
    frameTop + frameHeight,
  );
  ctx.quadraticCurveTo(
    frameLeft,
    frameTop + frameHeight,
    frameLeft,
    frameTop + frameHeight - radius,
  );
  ctx.lineTo(
    frameLeft,
    frameTop + radius,
  );
  ctx.quadraticCurveTo(
    frameLeft,
    frameTop,
    frameLeft + radius,
    frameTop,
  );
  ctx.closePath();
  if (frameBackgroundColor) {
    ctx.fill();
  }
  ctx.stroke();
};

const addFrame = (ctx, frame, frameColorHex, width, height) => {
  const frameTop = margin / 2;
  const frameLeft = margin / 2;
  const frameWidth = width - margin;
  const frameHeight = height - margin;
  const { backgroundColor, style } = frame;
  if (backgroundColor) {
    const backgroundColorHex = rgb2hex(backgroundColor.rgba);
    ctx.fillStyle = backgroundColorHex;
  }
  if (style) {
    const radius = style === 'square' ? 0 : 20;
    ctx.strokeStyle = frameColorHex;
    ctx.lineWidth = 5.0;
    addRoundRect(ctx, frameLeft, frameTop, frameWidth, frameHeight, backgroundColor, radius);
  } else {
    ctx.fillRect(0, 0, width, height);
  }
};

export const createQrCode = (text, darkColorHex, lightColorHex, width, frame, logo) => {
  const innerSize = frame ? width - margin * 2 : width;
  const height = frame && frame.text ? calculateHeight(innerSize, frame.text) : width;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  if (frame) {
    const frameColor = frame.color || { rgba: { r: 0, g: 0, b: 0 } };
    const frameColorHex = rgb2hex(frameColor.rgba);
    addFrame(ctx, frame, frameColorHex, width, height);
    const framePosition = frame.position || 'bottom';
    if (frame.text) {
      addText(ctx, framePosition, width, innerSize, frame, frameColorHex);
    }
  }

  addQrCode(ctx, text, darkColorHex, lightColorHex, innerSize, frame, width, height, logo);
  return canvas;
};
