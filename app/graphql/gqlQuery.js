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



export const GET_ASTROLOGER_PROFILE = gql`
  query GetAstrologerProfile {
    getAstrologerProfile {
      success
      message
      data {
        id
        name
        displayName
        profilePic
        email
        contactNo
        about
        gender
        languages
        skills
        problems
        experience
        rating
        totalReviews
        totalSessions
        tags
        vtags
        status
        createdAt

        wallet {
          balanceCoins
          totalEarned
          totalWithdrawn
        }

        pricing {
          type
          price
          offerPrice
          commissionPercent
          isActive
        }

        recentReviews {
          id
          rating
          comment
          userName
          createdAt
        }

        addresses {
          street
          city
          state
          country
          pincode
        }

        experiences {
          platformName
          yearsWorked
        }

        kycDetail {
          accountHolderName
          accountNumber
          bankName
          ifsc
          branchName
          panNumber
          profileImage
          aadhaarImage
          panImage
          passbookImage
          status
        }
      }
    }
  }
`;