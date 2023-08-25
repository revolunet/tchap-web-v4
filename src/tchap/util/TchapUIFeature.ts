/**
 * Tchap UI Feature flags
 */

export default class TchapUIFeature {
    /**
     * This flag controls weither space related settings should be displayed or not. It differs from the flag UIComponent.CreateSpaces.
     * It is intended to add more fine-grained control over spaces disablement.
     */
    public static isSpaceDisplayEnabled = true;

    /**
     * This flag controls weither Terms and Conditions should be accepted automatically or not.
     */
    public static autoAcceptTermsAndConditions = true;

    /**
     * This flag controls weither Email, Phone and Discovery UI should be displayed or not in General Settings.
     */
    public static showEmailPhoneDiscoverySettings = false;

    /**
     * This flag controls weither clearCacheAndReload can be queued at application start at V4 upgrade
     */
    public static activateClearCacheAndReloadAtVersion4 = true;

}
