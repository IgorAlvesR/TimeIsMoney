import { Component, OnInit, ViewChild } from '@angular/core';
import { Platform, LoadingController, NavController, ToastController } from '@ionic/angular';
import { Environment, GoogleMap, GoogleMaps, GoogleMapOptions, GoogleMapsEvent, MyLocation, GoogleMapsAnimation } from '@ionic-native/google-maps';
import { NativeGeocoder, NativeGeocoderOptions, NativeGeocoderResult } from '@ionic-native/native-geocoder/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { DeslocamentoService } from 'src/app/servicos/deslocamento.service';
import { Deslocamento } from 'src/app/Models/deslocamento';
import * as moment  from 'moment'

@Component({
  selector: 'app-registro-deslocamento',
  templateUrl: './registro-deslocamento.page.html',
  styleUrls: ['./registro-deslocamento.page.scss'],
})
export class RegistroDeslocamentoPage implements OnInit {

  @ViewChild('map') mapElement: any
  private loading: any
  private map: GoogleMap
  reserveGeocodingResults: string = ""
  private deslocamento: Deslocamento = {}


  constructor(
    private platform: Platform,
    private loadingCtrl: LoadingController,
    public nativeGeocoder: NativeGeocoder,
    public geolocation: Geolocation,
    private deslocamentoService: DeslocamentoService,
    private toastCtrl: ToastController,
    private navCtrl: NavController
  ) { }

  ngOnInit() {
    this.mapElement = this.mapElement.nativeElement
    this.mapElement.style.width = '100%'
    this.mapElement.style.height = '50%'
    this.loadMap()
  }

  async reverseGeocoding(latitude, longitude) {
    var options: NativeGeocoderOptions = {
      useLocale: true,
      maxResults: 1
    }
    await this.nativeGeocoder.reverseGeocode(latitude, longitude, options)
      .then((result: NativeGeocoderResult[]) => this.deslocamento.localizacao = result[0].subAdministrativeArea)
  }

  async registrarDeslocamento() {
    this.loading = await this.loadingCtrl.create({ message: 'Por favor, aguarde...' })
    await this.loading.present()
    await this.geolocation.getCurrentPosition().then((position) => {
      var latitude = position.coords.latitude
      var longitude = position.coords.longitude
      this.reverseGeocoding(latitude, longitude)
    })
    this.deslocamento.data = moment().locale('pt-br').format('L')
    this.deslocamento.hora = moment().locale('pt-br').format('LTS')

    try {
      await this.deslocamentoService.registrar(this.deslocamento)
      await this.navCtrl.navigateRoot('registro-hora-extra')
      await this.loading.dismiss()
    } catch (error) {
      this.toastCtrl.create({message: error, duration: 2000})
    }

  }



  async loadMap() {
    this.loading = await this.loadingCtrl.create({ message: 'Por favor, aguarde...' })
    await this.loading.present()

    Environment.setEnv({
      'API_KEY_FOR_BROWSER_RELEASE': 'AIzaSyClpig7cd7BKXZTeN93Xi7mUn57uzSFcqc',
      'API_KEY_FOR_BROWSER_DEBUG': 'AIzaSyClpig7cd7BKXZTeN93Xi7mUn57uzSFcqc'
    });

    const mapOptions: GoogleMapOptions = {
      controls: {
        zoom: false
      }
    }

    this.map = await GoogleMaps.create(this.mapElement, mapOptions)
    try {
      await this.map.one(GoogleMapsEvent.MAP_READY)
      await this.addOriginMarker()

    } catch (error) {
      console.error(error)
    }

  }

  async addOriginMarker() {
    try {
      const myLocation: MyLocation = await this.map.getMyLocation()
      await this.map.moveCamera({
        target: myLocation.latLng,
        zoom: 18
      })
      this.map.addMarkerSync({
        title: 'Localização Atual',
        icon: '#000',
        animation: GoogleMapsAnimation.DROP,
        position: myLocation.latLng
      })
    } catch (error) {
      console.error(error)
    } finally {
      this.loading.dismiss()
    }
  }
}
