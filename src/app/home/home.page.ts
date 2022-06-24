import { HttpClient } from '@angular/common/http';
import { AfterViewInit ,Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { IonContent, IonList, IonSlides } from '@ionic/angular';
import {tap,switchMap,map} from 'rxjs/operators';

export interface Category {
    id:number,
    name: string;
    detail_image:string;
    title: string;
    subtitle: string;
}

export interface Product {
  id:number;
  categories: number;
  name: string;
  thumbnail_image: string;
  detail_image: string;
  description: string;
  price: number;
}


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit,AfterViewInit{
 url = 'https://academy-coffee-shop-api.herokuapp.com/';
 categories: Category[] = [];
 products = [];
  opts = {
  freeMode: true,
  slidesPerView: 2.8,
  slidesOffsetBefore:30,
  slidesOffsetAfter: 100
  }

  activeCategory = 0;
  @ViewChildren(IonList, { read: ElementRef }) lists: QueryList<ElementRef>;
  listElements = [];
  @ViewChild(IonContent) content: IonContent;
  @ViewChild(IonSlides) slides: IonSlides;  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<Category[]>(`${this.url}/categories`).pipe(
      tap(categories => {
        for(let c of categories){
          c.detail_image = `${this.url}${c.detail_image}`;
        }
        this.categories = categories;
      }),
      switchMap(res => {
        console.log(res, ' swithmap');

        return this.http.get<Product[]>(`${this.url}/products`);
      }),
      map (products => {
        for(let product of products){
          product.thumbnail_image = `${this.url}${product.thumbnail_image}`;
        }
        return products;
      }),
      map(results => {
        const productMap = {};
        for(let product of results){
          if(!productMap[product.categories]){
            productMap[product.categories] = [product];
          } else {
            productMap[product.categories].push(product);
          }
        }
        const orderedProducts = [];

        Object.entries(productMap).forEach(([k,v]) => {
          const category = this.getCategory(+k);

          const entry = {
            ...category,
            products: v
          }
          orderedProducts.push(entry);
        });
        return orderedProducts;
      })
    )
    .subscribe(results => {
      this.products = results;
      // console.log(results);
    });
  }



  getCategory(catedoryId: number){
    return this.categories.filter(c => c.id === catedoryId)[0];
  }


  ngAfterViewInit(){
    this.lists.changes.subscribe(_ => {
      this.listElements = this.lists.toArray();
      console.log(this.listElements, 'listelements')
    })
  }

  selectCategory(index){
    const child = this.listElements[index].nativeElement;
    this.content.scrollToPoint(0, child.offsetTop - 30, 1000)
  }

  onScroll(ev){
    // console.log(ev);
    for(let i = 0; i < this.listElements.length; i++){
      const item = this.listElements[i].nativeElement;
      if(this.isElementInViewport(item)){
        this.activeCategory = i;
        this.slides.slideTo(i);
        break;

      }
    }
  }

  isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return(rect.height + rect.top) - 100 > 0;
  }
}
