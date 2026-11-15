import image0 from '../assets/images/producto-00.jpg';
import image1 from '../assets/images/producto-01.jpg';
import image2 from '../assets/images/producto-02.jpg';
import image3 from '../assets/images/producto-03.jpg';
import image4 from '../assets/images/producto-04.jpg';
import image5 from '../assets/images/producto-05.jpg';
import image6 from '../assets/images/producto-06.jpg';
import image7 from '../assets/images/producto-07.jpg';
import image8 from '../assets/images/producto-08.jpg';
import image9 from '../assets/images/producto-09.jpg';
import image10 from '../assets/images/producto-10.jpg';
import image11 from '../assets/images/producto-11.jpg';
import image12 from '../assets/images/producto-12.jpg';
import image13 from '../assets/images/producto-13.jpg';
import image14 from '../assets/images/producto-14.jpg';
import image15 from '../assets/images/producto-15.jpg';
import image16 from '../assets/images/producto-16.jpg';
import image17 from '../assets/images/producto-17.jpg';
import image18 from '../assets/images/producto-18.jpg';
import image19 from '../assets/images/producto-19.jpg';
import image20 from '../assets/images/producto-20.jpg';
import placeholder from '../assets/images/product-placeholder.svg';
import illSmartphone from '../assets/images/illustrations/smartphone.svg';
import illPrinter from '../assets/images/illustrations/printer.svg';
import illCharger from '../assets/images/illustrations/charger.svg';
import illWebcam from '../assets/images/illustrations/webcam.svg';
import illPsuCooling from '../assets/images/illustrations/psu-cooling.svg';
import illAccessories from '../assets/images/illustrations/accessories.svg';
import illSpeaker from '../assets/images/illustrations/speaker.svg';
import illHddExternal from '../assets/images/illustrations/hdd-external.svg';
import illPendriveSd from '../assets/images/illustrations/pendrive-sd.svg';
import illMonitorUltrawide from '../assets/images/illustrations/monitor-ultrawide.svg';
import illMonitorPortable from '../assets/images/illustrations/monitor-portable.svg';
import illPrinter3d from '../assets/images/illustrations/printer-3d.svg';
import illScannerLabeler from '../assets/images/illustrations/scanner-labeler.svg';
import illRouterWifi from '../assets/images/illustrations/router-wifi.svg';
import illNetworkTools from '../assets/images/illustrations/network-tools.svg';
import illLaptopStand from '../assets/images/illustrations/laptop-stand.svg';
import illLaptopBag from '../assets/images/illustrations/laptop-bag.svg';
import illPowerbank from '../assets/images/illustrations/powerbank.svg';
import illToolsElectronics from '../assets/images/illustrations/tools-electronics.svg';
import illTabletEreader from '../assets/images/illustrations/tablet-ereader.svg';
import illPcCase from '../assets/images/illustrations/pc-case.svg';
import illSmartphonePro from '../assets/images/illustrations/smartphone-pro.svg';

export const illustrations = {
  smartphone: illSmartphone,
  smartphonePro: illSmartphonePro,
  printer: illPrinter,
  printer3d: illPrinter3d,
  scannerLabeler: illScannerLabeler,
  charger: illCharger,
  powerbank: illPowerbank,
  webcam: illWebcam,
  psuCooling: illPsuCooling,
  pcCase: illPcCase,
  accessories: illAccessories,
  speaker: illSpeaker,
  hddExternal: illHddExternal,
  pendriveSd: illPendriveSd,
  monitorUltrawide: illMonitorUltrawide,
  monitorPortable: illMonitorPortable,
  routerWifi: illRouterWifi,
  networkTools: illNetworkTools,
  laptopStand: illLaptopStand,
  laptopBag: illLaptopBag,
  toolsElectronics: illToolsElectronics,
  tabletEreader: illTabletEreader,
};
const images = {
  "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80": image0,
  "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500&q=80": image1,
  "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&q=80": image2,
  "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80": image3,
  "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=500&q=80": image4,
  "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=500&q=80": image5,
  "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500&q=80": image6,
  "https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=500&q=80": image7,
  "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500&q=80": image8,
  "https://images.unsplash.com/photo-1562976540-1502c2145186?w=500&q=80": image9,
  "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&q=80": image10,
  "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500&q=80": image11,
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&q=80": image12,
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80": image13,
  "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&q=80": image14,
  "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&q=80": image15,
  "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&q=80": image16,
  "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&q=80": image17,
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&q=80": image18,
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&q=80": image19,
  "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=500&q=80": image20,
};
export function localProductImage(url) { return images[url] || placeholder; }
export { placeholder };
