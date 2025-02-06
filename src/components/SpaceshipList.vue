<template>
  <div class="card text-white">
    <div class="card-body">
      <h5 class="card-title mb-4">Spaceships</h5>
      <table class="table table-hover">
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Status</th>
            <th scope="col">HP</th>
            <th scope="col">Speed</th>
            <th scope="col">Cargo</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="ship in spaceships" :key="ship.id">
            <td>{{ ship.name }}</td>
            <td>
              <span class="badge" :class="getStatusClass(ship.status)">
                {{ ship.status }}
              </span>
            </td>
            <td>{{ ship.hp }}/{{ ship.maxHp }}</td>
            <td>{{ ship.speed }}</td>
            <td>{{ ship.currentCargo }}/{{ ship.maxCargo }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Spaceship {
  id: number;
  name: string;
  status: 'IDLE' | 'TRAVELING' | 'MINING' | 'DAMAGED';
  hp: number;
  maxHp: number;
  speed: number;
  currentCargo: number;
  maxCargo: number;
}

const spaceships: Spaceship[] = [
  {
    id: 1,
    name: "Explorer I",
    status: 'IDLE',
    hp: 100,
    maxHp: 100,
    speed: 10,
    currentCargo: 0,
    maxCargo: 1000
  },
  {
    id: 2,
    name: "Miner Alpha",
    status: 'MINING',
    hp: 85,
    maxHp: 120,
    speed: 8,
    currentCargo: 600,
    maxCargo: 2000
  },
  {
    id: 3,
    name: "Cargo Beta",
    status: 'TRAVELING',
    hp: 150,
    maxHp: 150,
    speed: 6,
    currentCargo: 1500,
    maxCargo: 5000
  },
  {
    id: 4,
    name: "Scout Delta",
    status: 'DAMAGED',
    hp: 30,
    maxHp: 80,
    speed: 15,
    currentCargo: 0,
    maxCargo: 500
  }
];

const getStatusClass = (status: Spaceship['status']) => {
  const classes = {
    'IDLE': 'bg-secondary',
    'TRAVELING': 'bg-primary',
    'MINING': 'bg-warning',
    'DAMAGED': 'bg-danger'
  };
  return classes[status];
};
</script>

