import 'clientjs'

export const getPositionOfCurrentUser = () => {
    if (navigator.geolocation) {
        return navigator.geolocation.getCurrentPosition(position => {
            console.log('====================================')
            console.log({
                lat: position.coords.latitude,
                long: position.coords.longitude
            })
            console.log('====================================')
        });
    }
    throw Error("Geolocation is not supported by this browser.")
}

export const getDigitalSignature = () => {
    var client = new ClientJS();

    var fingerprint = client.getFingerprint();
    var userAgent = client.getUserAgent();
    var device = client.getDevice();
    var os = client.getOS();
    var osV = client.getOSVersion();
    var window = client.isWindows();
    var mac = client.isMac();
    var linux = client.isLinux();
    var ubuntu = client.isUbuntu();
    var solaris = client.isSolaris();
    return {
        fingerprint,
        userAgent, device, os, osV, window, mac, linux, ubuntu, solaris
    }
}