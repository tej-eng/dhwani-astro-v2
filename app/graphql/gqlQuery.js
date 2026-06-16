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

// export const GET_ASTROLOGER_PROFILE = gql`
//   query GetAstrologerProfile {
//     getAstrologerProfile {
//       success
//       message
//       data {
//         id
//         name
//         displayName
//         profilePic
//         email
//         contactNo
//         about
//         gender
//         languages
//         skills
//         problems
//         experience
//         rating
//         totalReviews
//         totalSessions
//         tags
//         vtags
//         status
//         createdAt

//         wallet {
//           balanceCoins
//           totalEarned
//           totalWithdrawn
//         }

//         pricing {
//           type
//           price
//           offerPrice
//           commissionPercent
//           isActive
//         }

//         recentReviews {
//           id
//           rating
//           comment
//           userName
//           createdAt
//         }

//         addresses {
//           street
//           city
//           state
//           country
//           pincode
//         }

//         experiences {
//           platformName
//           yearsWorked
//         }

//         kycDetail {
//           accountHolderName
//           accountNumber
//           bankName
//           ifsc
//           branchName
//           panNumber
//           profileImage
//           aadhaarImage
//           panImage
//           passbookImage
//           status
//         }
//       }
//     }
//   }
// `;

export const GET_ASTROLOGER_BY_ID = gql`
  query GetAstrologerById($id: String!) {
    getAstrologerById(id: $id) {
      id
      name
      displayName
      profilePic
      about
      experience
      rating

      languages
      skills
      problems

      pricing {
        id
        type
        price
        offerPrice
      }

      reviews {
        id
        rating
        comment
        reply
        userName
        createdAt
      }
    }
  }
`;
export const GET_GIFTS = gql`
  query GetGifts {
    getGifts {
      totalCount
      data {
        id
        name
        amount
        image
        status
      }
    }
  }
`;

export const GET_SERVICES = gql`
  query GetServices {
    getServices {
      id
      name
      slug
      image
      description
      longText
      price

      category {
        id
        name
        slug
      }
    }
  }
`;

export const GET_SERVICE = gql`
  query GetService($slug: String!) {
    getService(slug: $slug) {
      id
      name
      slug
      image
      description
      longText
      price

      category {
        id
        name
      }
    }
  }
`;

export const GET_CATEGORIES = gql`
  query getCategories {
    getCategories {
      id
      name
      slug
      image
    }
  }
`;

export const GET_CATEGORY = gql`
 query GetCategory($slug: String!) {
  getCategory(slug: $slug) {
    id
    name
    slug

    services {
      id
      name
      slug
      image
      description
      price
    }
  }
}
`;

export const CREATE_SERVICE_BOOKING = gql`
  mutation CreateServiceBooking(
    $input: CreateServiceBookingInput!
  ) {
    createServiceBooking(input: $input) {
      id
      amount
      paymentStatus
      bookingStatus
    }
  }
`;

export const GET_ASTROLOGERS_USER = gql`
  query GetAstrologerListForUser(
    $searchInput: AstrologerSearchInput
  ) {
    getAstrologerListForUser(
      searchInput: $searchInput
    ) {
      totalCount
      currentPage
      totalPages

      data {
        id
        profilePic
        name
        experience
        rating
        skills
        languages

        activeOffer {
          id
          offerName
          price
          description
        }

        pricing {
          type
          price
          originalPrice
          offerPrice
          commissionPercent
          isActive
        }
      }
    }
  }
`;

export const GET_ASTROLOGERS_GUEST = gql`
  query GetAstrologers($searchInput: AstrologerSearchInput) {
    getAstrologerListBySearch(searchInput: $searchInput) {
      data {
        id
        profilePic
        name
        experience
        rating
        skills
        languages

        activeOffer {
          id
          offerName
          price
          description
        }

        pricing {
          type
          price
          offerPrice
          commissionPercent
          isActive
        }
      }

      totalPages
      currentPage
      totalCount
    }
  }
`;

export const UPDATE_BOOKING_ASTROLOGER = gql`
  mutation UpdateBookingAstrologer(
    $bookingId: ID!
    $astrologerId: ID!
  ) {
    updateBookingAstrologer(
      bookingId: $bookingId
      astrologerId: $astrologerId
    ) {
      id
      astrologerId
    }
  }
`;

export const GET_BLOGS = gql`
  query GetBlogs {
    blogs {
      id
      title
      slug
      featuredImage
      createdAt
        categories {
        id
        name
        slug
      }
  
    }
  }
`;

export const GET_BLOG_BY_SLUG = gql`
  query GetBlogBySlug($slug: String!) {
    blogBySlug(slug: $slug) {
      id
      title
      slug
      content
      featuredImage
      createdAt

      categories {
        id
        name
        slug
      }
    }
  }
`;
export const GET_BLOG_CATEGORIES = gql`
  query GetBlogCategories {
    blogCategories {
      id
      name
      slug
    }
  }
`;
