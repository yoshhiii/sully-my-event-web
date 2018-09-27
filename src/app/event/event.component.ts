import { Component, OnInit } from '@angular/core';
import { SelectItem, MenuItem } from 'primeng/primeng';
import { YelpService } from '../core/yelp.service';
import { LocationFilter } from '../models/location-filter.model';
import { YelpResult, YelpResults } from '../models/yelp-results.model';
import { UserService } from '../core/user.service';
import { EventsService } from '../core/events.service';
import { SelectedLocation } from '../models/location.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.scss']
})
export class EventComponent implements OnInit {
  users = Array<SelectItem>();
  prices: SelectItem[];
  stars: SelectItem[];
  selectedUsers: number[] = [];
  selectedPrices: number[] = [];
  selectedStars: number[] = [];
  date: Date;
  title: string;
  location: string;
  description: string;
  radius: number;
  index = 0;
  items: MenuItem[];
  activeIndex = 0;
  searchTerm: string;
  restaurantResults: YelpResults;
  eventUsers = Array<{ userId: number }>();
  eventLocations = Array<SelectedLocation>();

  constructor(private yelpService: YelpService,
    private userService: UserService,
    private eventService: EventsService,
    private router: Router) { }

  ngOnInit() {
    this.userService.getUsers().subscribe((userList) => {
      userList.forEach(user => {
        const selectItem: SelectItem = {
          label: user.firstName,
          value: user.id
        };
        this.users.push(selectItem);
      });
    });

    this.prices = [
      { label: '$', value: 1},
      { label: '$$ ', value: 2},
      { label: '$$$ ', value: 3},
      { label: '$$$$ ', value: 4}
    ];

    this.stars = [
      { label: '*', value: 1},
      { label: '** ', value: 2},
      { label: '***', value: 3},
      { label: '**** ', value: 4},
      { label: '***** ', value: 5}
    ];


    this.items = [
      {label: 'Event Details'},
      {label: 'Restaurant Criteria'},
      {label: 'Restaurant Selections'}
  ];
  }

  openNext() {
    this.index = (this.index === 2) ? 0 : this.index + 1;
  }

  save() {
    this.selectedUsers.forEach((x) => {
      this.eventUsers.push({userId: x});
    });
    const event = {
      title: this.title,
      description: this.description,
      eventTime: this.date,
      selectedLocations: this.eventLocations,
      eventUsers: this.eventUsers,
      createdById: localStorage.getItem('userId'),
      createdBy: 'test'
    };
    this.eventService.createEvent(1, event).subscribe(() => {
      this.router.navigate(['']);
    });
  }

  getRestaurants() {
    const filterData = new LocationFilter(this.location, this.selectedPrices.join(), Math.floor(this.radius / .00062137), this.searchTerm);
    this.yelpService.searchBusinesses(filterData).subscribe((results) => {
      this.restaurantResults = results;
      this.activeIndex = 2;
    });
  }

  cardClicked(result: any) {
    if (!this.eventLocations.find(x => x.yelpId === result.id)) {
      this.eventLocations.push(
        new SelectedLocation(result.id, result.price, result.rating, result.name, result.location.address1, result.image_url, result.url));
        console.log(this.eventLocations);
    }
  }
}
