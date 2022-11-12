import axios from 'axios';
import { GraphQLClient } from 'graphql-request';
import FormData from 'form-data';
import {
  updateAsset, publishAsset, deactivateAsset, connectQrCode, publishPage,
} from '../libs/hygraph/mutation';

const apiUrl = process.env.REACT_APP_HYGRAPH_API_URL;
const token = process.env.REACT_APP_HYGRAPH_API_TOKEN;

const hygraph = new GraphQLClient(apiUrl, {
  headers: {
    authorization: `Bearer ${token}`,
  },
});

const updateHygraphAsset = async (
  id,
  lightColor,
  darkColor,
) => {
  const mutation = await updateAsset();
  const mutationVariables = {
    id,
    lightColor,
    darkColor,
  };
  return hygraph.request(mutation, mutationVariables);
};

const publishHygraphAsset = async (asset) => {
  const mutation = await publishAsset();
  const mutationVariables = {
    id: asset,
  };
  return hygraph.request(mutation, mutationVariables);
};

const deactivateHygraphAsset = async (asset) => {
  const mutation = await deactivateAsset();
  const mutationVariables = {
    id: asset,
  };
  return hygraph.request(mutation, mutationVariables);
};

const connectHygraphQrCode = async (
  pageId,
  assetId,
  qrCodeId,
) => {
  const mutation = await connectQrCode();
  const mutationVariables = {
    pageId,
    qrCodeId,
    assetId,
  };
  return hygraph.request(mutation, mutationVariables);
};

const publishHygraphPage = async (id) => {
  const mutation = await publishPage();
  const mutationVariables = {
    id,
  };
  return hygraph.request(mutation, mutationVariables);
};

export const conncectQrCode = async (assetId, lightColor, darkColor, pageId, qrCodeId, imageId) => {
  await updateHygraphAsset(assetId, lightColor, darkColor);
  await publishHygraphAsset(assetId);
  if (imageId) {
    await deactivateHygraphAsset(imageId);
  }
  await connectHygraphQrCode(
    pageId,
    assetId,
    qrCodeId,
  );
  await publishHygraphPage(pageId);
  return true;
};

export const uploadQrCode = async (slug, img) => {
  const imgBlob = await new Promise((resolve) => {
    img.toBlob((blob) => resolve(blob));
  });
  const formData = new FormData();
  formData.append('fileUpload', imgBlob, `${slug}.png`);
  const res = await axios({
    method: 'post',
    url: `${apiUrl}/upload`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: formData,
  });
  console.log(res.data);
  return res.data;
};
