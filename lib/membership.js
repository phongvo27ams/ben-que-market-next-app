export const PLUS_PLAN = "plus";
export const MEMBERSHIP_ACTIVE = "active";

export const isPlusActiveMember = (user) => {
  if (!user) return false;
  return user.membershipPlan === PLUS_PLAN && user.membershipStatus === MEMBERSHIP_ACTIVE;
};
