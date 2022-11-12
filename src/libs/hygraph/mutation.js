const { gql } = require('graphql-request');

export const updateAsset = async () => gql`
    mutation UpdateAsset($id: ID!, $darkColor: Hex, $lightColor: Hex, $sha1: String) {
      updateAsset(
        where: { id: $id }
        data: {
          active: true
          darkColor: { hex: $darkColor }
          lightColor: { hex: $lightColor }
          sha1: $sha1
        }
      ) {
        id
      }
    }
  `;

export const publishAsset = async () => gql`
    mutation PublishAsset($id: ID!) {
      publishAsset(where: { id: $id }) {
        id
        stage
      }
    }
  `;

export const deactivateAsset = async () => gql`
    mutation DeactiveAsset($id: ID!) {
      updateAsset(data: { active: false }, where: { id: $id }) {
        id
      }
    }
  `;

export const deleteAsset = async () => gql`
    mutation DeleteAsset($id: ID!) {
      deleteAsset(where: { id: $id }) {
        id
      }
    }
  `;

export const connectQrCode = async () => gql`
    mutation ConnectQrCode(
      $pageId: ID
      $assetId: ID
      $qrCodeId: ID
    ) {
      updatePage(
        data: {
          qrCode: {
            update: {
              where: {
                id: $qrCodeId
              }, 
              data: {
                image: {
                  connect: {
                    id: $assetId
                  }
                }
              }
            }
          }
        }
        where: {id: $pageId}
      ) {
        id
      }
    }
  `;

export const publishPage = async () => gql`
    mutation PublishPage($id: ID) {
      publishPage(where: { id: $id }) {
        id
        stage
      }
    }
  `;
