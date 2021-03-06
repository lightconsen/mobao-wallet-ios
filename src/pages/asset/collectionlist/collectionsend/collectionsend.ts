import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController  } from 'ionic-angular';
import { WalletProvider } from '../../../../providers/wallet';
import { Storage } from "@ionic/storage";
import { AppConfig } from '../../../../app/app.config';
import { Md5 } from 'ts-md5/dist/md5';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { TranslateService } from '@ngx-translate/core';
import { BaseUI } from "../../../common/baseui";
/**
 * Generated class for the CollectionsendPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-collectionsend',
  templateUrl: 'collectionsend.html',
})
export class CollectionsendPage extends BaseUI {
  code:string='';
  ID:string='';
  address:string='';//接收方地址
  saturation:number=10000;
  gas:number=0;//
  moac:number=0;
  user:any={};
  token:any={};//去联系人传值用
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public alertCtrl:AlertController, 
    public translate: TranslateService,
    private barcodeScanner: BarcodeScanner,
    public walletProvider:WalletProvider,
    private storage:Storage) {
        super();
      this.code=this.navParams.get('token').code;
      this.token=this.navParams.get('token');
      this.ID=this.navParams.get('ID');
      this.estimateGas();
  }
  ionViewDidEnter(){

    if(this.navParams.get('contsItem')){
          this.address=this.navParams.get('contsItem').address || '';
    }else{
      //   console.log(this.navParams.get('contact'))
    }
}
  async next(){//点击下一步
    if(this.walletProvider.isValidAddress(this.address.replace(/\s+/g, ""))==false){
        this.errorMsg(this.getResult("assets.7"));
        return
    }
    this.user = await this.storage.get('user');
    let that = this;
    let prompt = this.alertCtrl.create({
      title:this.getResult("assets.8"),
      message: '',
      inputs: [
        {
          type: 'password',
          name: 'password',
          placeholder:this.getResult("assets.8"),
        },
      ],
      buttons: [
        {
          text:this.getResult("assets.9"),
          handler: data => {
          }
        },
        {
          text:this.getResult("assets.10"),
          handler: async function(data){
              if(Md5.hashStr(data.password) == that.user.pwd){
                  if(that.user){
                    let secret = AppConfig.secretDec('call',that.user.pwd,that.user.secret) || AppConfig.secretDec('call','123456',that.user.secret);
                    let address = that.address.replace(/\s+/g, "");
                    let option = {
                        'assetCode':that.code,
                        'gasPrice':that.gas,
                        'gasLimit':that.saturation,
                        'erc721':true,
                        'tokenId':that.ID
                    };
                      if(await that.walletProvider.sendTransaction(secret,address,1,option)){
                          that.errorMsg(that.getResult("assets.11"));
                          that.navCtrl.popToRoot();
                      }else{
                          that.errorMsg(that.getResult("assets.12"));
                      }
                  }
              }else{
                  that.errorMsg(that.getResult("assets.13"));
              }
          }
        }
      ]
    });
    prompt.present();
    
}
  async estimateGas(){// 获得建议手续费gas
      this.saturation =await this.walletProvider.estimateGas('');
      console.log('gasPrice',this.saturation)
      this.gasPrice();
  };
  gasPrice(){//矿工费
      this.gas = this.walletProvider.gasPrice();
      this.moac = this.walletProvider.gasPriceToMoac(this.gas*this.saturation);
  }
  errorMsg(msg){
      //错误提示
      let prompt = this.alertCtrl.create({
          title:this.getResult("assets.1"),
          message: msg,
          buttons: [
              {
                text: 'OK',
                handler: data => {
                }
              }
          ]
      });
      prompt.present();
  }   
  ionViewDidLoad() {
    console.log('ionViewDidLoad CollectionsendPage');
  }
  Scan(){//扫码
    this.barcodeScanner.scan().then((barcodeData) => {
        if (barcodeData.cancelled) {
          return false;
        }
        if(barcodeData){
            this.address=barcodeData.text;
        }
      }).catch(err=>{
        console.log(err)
      });
}
toCont(){//去联系人选择
    this.navCtrl.push('ContactslistPage',{
        'send':true,
        'sendpage':'TokensendPage',
        'token':this.token
    })
}
getResult(msg){
    return super.getI18n(msg,this.translate)
}
}
