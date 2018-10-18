module.exports = function GetBranchName(ref) {
  if (!ref) {
    return 'unknown';
  }

  // Slice ref/heads and leave the rest, it should be a branch name
  // for example refs/heads/feature/4 -> feature/4
  return ref.split('/').slice(2).join('/');
};
