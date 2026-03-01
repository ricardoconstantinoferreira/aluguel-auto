import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root'})
export class BuyService {

    constructor(
        private http: HttpClient
    ) { } 

    getCartItemsCount() {
        const customerId = localStorage.getItem('customer_id');
        const uri = 'api/auto/prerent/qty/' + customerId;
        return this.http.get(uri);
    }

    getCartItems() {
        const customerId = localStorage.getItem('customer_id');
        const uri = 'api/auto/prerent/' + customerId;
        return this.http.get(uri);
    }

    removeFromCart(itemId: number) {
        const uri = 'api/auto/prerent/' + itemId;
        return this.http.delete(uri);
    }

}