import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-room',
  standalone: true,
  imports: [],
  templateUrl: './room.component.html',
  styleUrl: './room.component.scss'
})
export class RoomComponent implements OnInit {
  roomId: number = 0;
  constructor(private route: ActivatedRoute) {

  }

  ngOnInit() {
    this.roomId = Number(this.route.snapshot.paramMap.get('id'));

    
  }
}
