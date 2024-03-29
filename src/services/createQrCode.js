import QRCode from 'qrcode';
import { createCanvas, loadImage } from 'canvas';

const fontSizes = [
  46, 48, 44, 42, 40, 38, 36, 34, 32, 30, 28, 26, 24, 22, 20, 18, 16, 14, 12, 10, 8, 6, 4, 2, 0,
];

const textMargin = 7;
const canvasMargin = 100;

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
        width: textDimensions.width,
      };
    });
  }
  return null;
};

const calculateHeight = (width, margin, text) => {
  const textItems = parseText(width, text);
  if (textItems) {
    const height = textItems.reduce(
      (previousValue, currentValue) => previousValue + currentValue.size + textMargin,
      0,
    );
    return width + margin * 2 + height + textMargin;
  }
  return width;
};

const addTitle = (ctx, framePosition, width, height, frame, frameColorHex) => {
  const top = framePosition === 'top' ? height + (canvasMargin / 2) - (width / 50) - 1 : canvasMargin / 2;
  const { backgroundColor, title } = frame;
  let backgroundColorHex = '#ffff00';
  if (backgroundColor) {
    backgroundColorHex = rgb2hex(backgroundColor.rgba);
  }
  ctx.fillStyle = backgroundColorHex;
  const [textItems] = parseText(width / 2, title);
  const { size, width: titleWidth } = textItems;
  const left = (width / 2) - ((titleWidth + 50) / 2) + (canvasMargin / 2);
  ctx.fillRect(left, top - 5, titleWidth + 50, (width / 50 + 10));

  const textLeft = (width / 2) - ((titleWidth + 25) / 2) + (canvasMargin / 2);
  ctx.fillStyle = frameColorHex;
  ctx.textBaseline = 'top';
  ctx.font = `bold ${size}px sans-serif`;
  ctx.fillText(title, textLeft, top - textMargin);
};

const addText = (ctx, framePosition, width, innerSize, margin, frame, frameColorHex) => {
  let top = framePosition === 'top' ? margin : width - textMargin;
  const textItems = parseText(innerSize, frame.text);
  textItems.forEach((textItem) => {
    const { text, size } = textItem;
    ctx.fillStyle = frameColorHex;
    ctx.textBaseline = 'top';
    ctx.font = `bold ${size}px sans-serif`;
    const left = (width - ctx.measureText(text).width) / 2;
    ctx.fillText(text, left + (canvasMargin / 2), top + (canvasMargin / 2));
    top += size + textMargin;
  });
};

const addQrCode = async (ctx, text, darkColorHex, lightColorHex, innerSize, margin, frame, width, height, logo) => {
  const qrWidth = innerSize * 0.9;
  const qrCodeCanvas = createCanvas(innerSize, innerSize);
  QRCode.toCanvas(
    qrCodeCanvas,
    text,
    {
      width: qrWidth,
      margin: 0,
      color: {
        dark: darkColorHex || '#000000',
        light: lightColorHex || '#ffffff',
      },
    },
  );

  let innerTop = frame ? margin : 0;
  let innerLeft = frame ? margin : 0;
  if (frame && frame.position === 'top') {
    innerTop = height - width + margin;
  }
  innerTop += (canvasMargin / 2) + innerSize * 0.05;
  innerLeft += (canvasMargin / 2) + innerSize * 0.05;
  ctx.drawImage(qrCodeCanvas, innerLeft, innerTop);

  if (logo && logo.logo) {
    const { logo: { url } } = logo;
    const img = await loadImage(url, { crossOrigin: 'Anonymous' });

    const maxWidth = innerSize / 3;
    let logoWidth = img.width;
    let logoHeight = img.height;
    if (logoWidth > maxWidth || logoHeight > maxWidth) {
      const ratio = 1 / (img.width / img.height);
      if (logoWidth > logoHeight) {
        logoWidth = maxWidth;
        logoHeight = ratio * logoWidth;
      } else {
        logoHeight = maxWidth;
        logoWidth = ratio * logoHeight;
      }
    }
    const logoX = logoWidth / 6;
    const logoY = logoHeight / 6;
    const logoTop = innerTop + qrWidth / 2 - logoHeight / 2;
    const logoLeft = innerLeft + qrWidth / 2 - logoWidth / 2;
    ctx.fillStyle = lightColorHex || '#ffffff';
    ctx.fillRect(
      logoLeft - logoX,
      logoTop - logoY,
      logoWidth + logoX * 2,
      logoHeight + logoY * 2,
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

const addFrame = (ctx, frame, frameColorHex, backgroundColorHex, width, height) => {
  const lineWidth = width / 50;
  const frameTop = (lineWidth / 2) + (canvasMargin / 2);
  const frameLeft = (lineWidth / 2) + (canvasMargin / 2);
  const frameWidth = width - lineWidth;
  const frameHeight = height - lineWidth;
  const { backgroundColor, style } = frame;
  ctx.fillStyle = backgroundColorHex;
  if (style) {
    const radius = style === 'square' ? 0 : 20;
    ctx.strokeStyle = frameColorHex;
    ctx.lineWidth = lineWidth;
    addRoundRect(ctx, frameLeft, frameTop, frameWidth, frameHeight, backgroundColor, radius);
  } else {
    ctx.fillRect(0, 0, width, height);
  }
};

export const createQrCode = async (text, darkColorHex, lightColorHex, width, frame, logo) => {
  const margin = width / 20;
  const innerSize = frame ? width - margin * 2 : width;
  const height = frame && frame.text ? calculateHeight(innerSize, margin, frame.text) : width;
  const canvas = createCanvas(width + canvasMargin, height + canvasMargin);
  const ctx = canvas.getContext('2d');

  if (frame) {
    const frameColor = frame.color || { rgba: { r: 0, g: 0, b: 0 } };
    const frameColorHex = rgb2hex(frameColor.rgba);
    const frameBackgroundColor = frame.backgroundColor || { rgba: { r: 255, g: 255, b: 255 } };
    const frameBackgroundColorHex = rgb2hex(frameBackgroundColor.rgba);
    ctx.fillStyle = frameBackgroundColorHex;
    ctx.fillRect(0, 0, width + canvasMargin, height + canvasMargin);

    addFrame(ctx, frame, frameColorHex, frameBackgroundColorHex, width, height);
    const framePosition = frame.position || 'bottom';
    if (frame.title) {
      addTitle(ctx, framePosition, width, height, frame, frameColorHex);
    }
    if (frame.text) {
      addText(ctx, framePosition, width, innerSize, margin, frame, frameColorHex);
    }
  }

  await addQrCode(ctx, text, darkColorHex, lightColorHex, innerSize, margin, frame, width, height, logo);
  return canvas;
};
