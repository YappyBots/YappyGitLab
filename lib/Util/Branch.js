module.exports = function GetBranchName(ref) {
  if (!ref) {
    return 'unknown';
  }

  let splitedRef = ref.split('/');

  // It slice /ref/heads and leave the rest, it should be a branch name
  // for example refs/heads/feature/4 -> feature/4
  if (splitedRef.length > 2) {
    return splitedRef.slice(2).join('/');
  }

  return ref;
};
