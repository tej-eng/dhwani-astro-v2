"use client";

import ProfileHeader from "./ProfileHeader";
import PersonalInfo from "./PersonalInfo";
import { GET_USER_DASHBOARD } from "@/app/graphql/gqlQuery";
import { useQuery } from "@apollo/client/react";
import StatsCards from "./StatsCard";

export default function UserProfilePage() {

   const {
  data,
  loading,
  error,
  refetch,
} = useQuery(GET_USER_DASHBOARD);

    // if(loading) return <Loader/>

    const user=data?.getUserDashboard;

    return(

        <div className="max-w-7xl mx-auto p-6 space-y-6">

            <ProfileHeader user={user}/>

          <StatsCards
    stats={user?.stats}
/>

            <div className="grid lg:grid-cols-3 gap-6">

  <PersonalInfo
  user={user}
  refetch={refetch}
/>

                {/* <WalletSummary user={user}/> */}

            </div>

        </div>

    )

}