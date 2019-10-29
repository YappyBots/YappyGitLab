const Pad = require('./Pad');
const MergeDefault = require('./MergeDefault');
const GetBranchName = require('./Branch');

/**
 * Some utilities :)
 */
class Util {
  /**
   * Add padding to the right of a string
   * @param {String} string - The string to pad
   * @param {Integer} length - Length of final string
   * @return {String} The string with padding on the right
   */
  Pad(...args) {
    return Pad(...args);
  }
  /**
   * Merge an object with a defaults object
   * @param {Object} def Default
   * @param {Object} given Object given to merge with default
   * @return {Object} Merged object
   */
  MergeDefault(...args) {
    return MergeDefault(...args);
  }

  /**
   * Get branch name from ref
   * @param {String} ref - ref from gitlab payload
   * @return {String} Branch name
   */
  GetBranchName(...args) {
    return GetBranchName(...args);
  }
}

module.exports = new Util();
