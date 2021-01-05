declare var require: any;
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
let tokens = require('../../../tokens/index');
import { Storage } from "@ionic/storage";
import { WalletProvider } from '../../../providers/wallet';
import { HttpClient } from "@angular/common/http";
import { TranslateService } from '@ngx-translate/core';
import { BaseUI } from "../../common/baseui";
/**
 * Generated class for the AddassetsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-addassets',
  templateUrl: 'addassets.html',
})
export class AddassetsPage extends BaseUI {
  tokens:any = this.walletProvider.tokens;
  ERC721:any=[];
  ERC20:any=[];
  myInput:string='';
  type:string='pass';//pass通证 collection收藏品
  search:any = {};//搜索结果
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private storage:Storage,
    private http: HttpClient,
    public translate: TranslateService,
    private walletProvider:WalletProvider,
    public alertCtrl:AlertController) {
        super();
        this.type = this.navParams.get('type');
    }
    ionViewWillEnter() {
      this.getTokens();
    }
    async onInput(){//搜索
        console.log(this.myInput);
        this.search = await  this.walletProvider.contractInfo(this.myInput);
        this.ERC20 = [];
        this.ERC721 = [];
        console.log(this.search);
        if(this.search){
            this.storage.get('tokens').then((to)=>{
                if(to){
                    for(let key in to.ERC20){
                        if(to.ERC20[key].address == this.myInput){
                            this.search.flag = true;
                            this.search.symbol = to.ERC20[key].symbol+'1';
                        }else{
                            this.search.flag = false;
                        }
                    }
                    for(let key in to.ERC721){
                        if(to.ERC721[key].address == this.myInput){
                            this.search.flag = true;
                            this.search.symbol = to.ERC721[key].symbol+'1';
                        }else{
                            this.search.flag = false;
                        }
                    }
                }else{
                    
                }
            })
        }
    }
    searchAddAssets(search){//添加搜索的结果
        if(this.type == 'pass'){//通证添加
            this.storage.get('tokens').then((to)=>{
                if(to){
                    let oldToken = to;
                    let key:string = search.symbol
                    oldToken.ERC20[key] = search;
                    oldToken.ERC20[key].address = this.myInput;
                    oldToken.ERC20[key].flag = true;
                    this.storage.set('tokens',oldToken);
                    this.search = {};
                    this.myInput = '';
                    this.ERC20 = [];
                    this.ERC721 = [];
                    this.navCtrl.pop();
                    this.getTokens();
                }
            });
        }else if(this.type == 'collection'){//收藏品添加
            if(search.decimals > 0){
                this.errorMsg(this.getResult("assets.44"));
                search.flag = false;
                return
            }
            this.storage.get('tokens').then((to)=>{
                if(to){
                    let oldToken = to;
                    let key:string = search.symbol
                    oldToken.ERC721[key] = search;
                    oldToken.ERC721[key].address = this.myInput;
                    oldToken.ERC721[key].flag = true;
                    this.storage.set('tokens',oldToken);
                    this.search = {};
                    this.myInput = '';
                    this.ERC20 = [];
                    this.ERC721 = [];
                    this.navCtrl.pop();
                    this.getTokens();
                }
            });
        }
    }
    addAssets(item){
        console.log(item)
        this.storage.get('tokens').then((to)=>{
            if(to){
                for(let key in to.ERC20){
                    if(to.ERC20[key].symbol == item.symbol){
                        to.ERC20[key].flag = !to.ERC20[key].flag;
                    }
                }
                for(let key in to.ERC721){
                    if(to.ERC721[key].symbol == item.symbol){
                        to.ERC721[key].flag = !to.ERC721[key].flag;
                    }
                } 
                this.storage.set('tokens',{
                    'ERC20':to.ERC20,
                    'ERC721':to.ERC721
                })
            }else{
                
            }
        })
    }
    getTokens(){
        this.storage.get('tokens').then((to)=>{
            if(to){
                let token20:any = [];
                let token721:any = [];
                for(let item in this.tokens.ERC20){
                    token20.push(this.tokens.ERC20[item]);
                }
                for(let item in this.tokens.ERC721){
                    token721.push(this.tokens.ERC721[item]);
                }
                for(let key in to.ERC20){
                    if(to.ERC20[key] && to.ERC20[key].flag === true){
                        for(let item in token20){
                            if(token20[item].symbol == to.ERC20[key].symbol){
                                token20[item].flag = true;
                            }
                        }
                    }else{
                        
                    }
                }
                for(let key in to.ERC721){
                    if(to.ERC721[key] && to.ERC721[key].flag === true){
                        for(let item in token721){
                            if(token721[item].symbol == to.ERC721[key].symbol){
                                token721[item].flag = true;
                            }
                        }
                    }else{
                        
                    }
                }
                this.ERC20 = token20;
                this.ERC721 = token721;
            }else{
                for(let key in this.tokens.ERC20){
                    this.tokens.ERC20[key].flag = false;
                    this.ERC20.push(this.tokens.ERC20[key]);
                }
                for(let key in this.tokens.ERC721){
                    if(this.tokens.ERC721[key].symbol == 'NFT'){
                        this.tokens.ERC721[key].flag = true;
                    }else{
                        this.tokens.ERC721[key].flag = false;
                    }
                    this.ERC721.push(this.tokens.ERC721[key]);
                }
                console.log(this.ERC20);
                console.log(this.ERC721);
            }
            this.storage.set('tokens',{
                'ERC20':this.tokens.ERC20,
                'ERC721':this.tokens.ERC721,
            });
        })
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
    getResult(msg){
        return super.getI18n(msg,this.translate)
    }
}
