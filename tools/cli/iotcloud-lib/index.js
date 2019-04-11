const AuthManager = require('./controllers/AuthManager');
const AwsManager = require('./controllers/AwsManager');
const C2cDeviceProfileManager = require('./controllers/C2cDeviceProfileManager');
const CapabilityManager = require('./controllers/CapabilityManager');
const CertManager = require('./controllers/CertManager');
const CoapMessage = require('./models/CoapMessage');
const CoapOptions = require('./models/CoapOptions');
const Configurator = require('./controllers/Configurator');
const DeviceManager = require('./controllers/DeviceManager');
const DeviceProfile = require('./models/DeviceProfile');
const DeviceProfileManager = require('./controllers/DeviceProfileManager');
const DeviceResourceManager = require('./controllers/DeviceResourceManager');
const DevPortalManager = require('./controllers/DevPortalManager');
const FileSystemHandler = require('./controllers/FileSystemHandler');
const GroupManager = require('./controllers/OcfGroupManager');
const IotCloudAgent = require('./controllers/IotCloudAgent');
const IotCloudClient = require('./controllers/IotCloudClient');
const IotCloudServer = require('./controllers/IotCloudServer');
const LocationManager = require('./controllers/LocationManager');
const ManifestManager = require('./controllers/ManifestManager');
const MetaDataGenerator = require('./controllers/MetaDataGenerator');
const OcfDeviceManager = require('./controllers/OcfDeviceManager');
const OcfGroupManager = require('./controllers/OcfGroupManager');
const OcfLogManager = require('./controllers/OcfLogManager');
const OneAppController = require('./controllers/OneAppController');
const Project = require('./models/Project');
const ProjectManager = require('./controllers/ProjectManager');
const ResourceTypeManager = require('./controllers/ResourceTypeManager');
const SmartApp = require('./models/SmartApp');
const SmartAppInstManager = require('./controllers/SmartAppInstManager');
const SmartAppManager = require('./controllers/SmartAppManager');
const SmartAppSchManager = require('./controllers/SmartAppSchManager');
const SmartAppSubManager = require('./controllers/SmartAppSubManager');
const PluginManager = require('./controllers/PluginManager');
const SmartAppSubscription = require('./models/SmartAppSubscription');
const StError = require('./errors/StError');
const StLogger = require('./common/StLogger');
const StLogManager = require('./controllers/StLogManager');
const TextHandler = require('./common/TextHandler');
const util = require('./common/util');
const WebConsoleProjectManager = require('./controllers/WebConsoleProjectManager');
const ThingsSdkConverter = require('./controllers/ThingsSdkConverter');


const library = {
  /* COMMON */
  StLogger,
  TextHandler,
  util,
  /* ERROR */
  StError,
  /* CONTROLLER */
  AuthManager,
  AwsManager,
  C2cDeviceProfileManager,
  CapabilityManager,
  CertManager,
  Configurator,
  DeviceManager,
  DeviceProfileManager,
  DeviceResourceManager,
  DevPortalManager,
  FileSystemHandler,
  GroupManager,
  IotCloudAgent,
  IotCloudClient,
  IotCloudServer,
  LocationManager,
  ManifestManager,
  MetaDataGenerator,
  OcfDeviceManager,
  OcfGroupManager,
  OcfLogManager,
  OneAppController,
  ProjectManager,
  ResourceTypeManager,
  SmartAppInstManager,
  SmartAppManager,
  SmartAppSchManager,
  SmartAppSubManager,
  StLogManager,
  WebConsoleProjectManager,
  ThingsSdkConverter,
  PluginManager,
  /* MODEL */
  CoapMessage,
  CoapOptions,
  Project,
  SmartApp,
  SmartAppSubscription,
  DeviceProfile,
};

module.exports = library;
