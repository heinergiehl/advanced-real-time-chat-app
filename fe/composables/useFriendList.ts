export interface Friend extends User {
  notification?: Notification
}

export const useFriendList = () => {
  const { callApi } = useApi()
  const routeName = useRoute().name
  const userProfileQuery = useUserProfile(routeName)

  const { data, isLoading, refetch, error } = useQuery({
    queryKey: ["friends"],
    queryFn: async () => {
      const result = await callApi<{ friendRequests: FriendRequest[] }>(
        "/friend-request/friends",
        {
          method: "GET",
          credentials: "include",
        }
      )
      const currentUserId = userProfileQuery.data.value?.user?.id
      if (!result.friendRequests || !currentUserId) return []
      const friends = result.friendRequests.map((friendRequest) => {
        if (friendRequest.sender) {
          const friend =
            friendRequest.senderId === currentUserId
              ? friendRequest.receiver
              : friendRequest.sender
          if (friendRequest?.notifications) {
            const acceptedNotification = friendRequest.notifications.find(
              (n) =>
                n.type === "FRIEND_REQUEST_ACCEPTED" &&
                n.userId === currentUserId
            )
            return {
              ...friend,
              notification: acceptedNotification,
            }
          }
        }
        return null
      })
      return friends.filter((f) => f !== null) as Friend[]
    },
  })

  const friendsArray = computed(() => data.value || [])
  return { friends: friendsArray, isLoading, refetch, error }
}
