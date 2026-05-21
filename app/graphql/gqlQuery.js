import { gql } from "@apollo/client";

export const CREATE_APPLICATION = gql`
  mutation CreateAstrologerApplication($input: CreateApplicationInput!) {
    createAstrologerApplication(input: $input) {
      id
      name
      email
    }
  }
`;