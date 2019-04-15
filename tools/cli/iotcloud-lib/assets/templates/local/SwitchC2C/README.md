You must set authorization of smart-app before installing smart-app
> st update smart-app-oauth --id \<your-smart-app-id\> --client-name \<your-smart-app-name\> --scope i:deviceprofiles w:devices:*

You must set profileId, deviceName before installing smart-app
> st update smart-app-settings --id \<your-smart-app-id\> --settings profileId:\<your-c2c-device-profile-id\> deviceName:\<your-c2c-device-name\>