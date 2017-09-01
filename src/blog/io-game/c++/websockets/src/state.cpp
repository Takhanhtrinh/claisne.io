#include "state.hpp"

namespace iogame {
  State::State(int id, float x, float y) {
    this->id = id;
    this->x = x;
    this->y = y;
  }

  void State::update_position(int dt) {
    float speed_x = (this->target_x - this->x);
    float speed_y = (this->target_y - this->y);

    float speed = std::sqrt((speed_x * speed_x) + (speed_y * speed_y));

    if (speed > 1) {
      float t = (dt / 5.);

      if (t < speed) {
        speed_x = (speed_x / speed) * t;
        speed_y = (speed_y / speed) * t;
      }

      this->x += speed_x;
      this->y += speed_y;
    }
  }

  void State::set_position_target(int x, int y) {
    this->target_x = x;
    this->target_y = y;
  }

  bool State::is_eating(Food &food) {
    float x = (this->x - food.x) * (this->x - food.x);
    float y = (this->y - food.y) * (this->y - food.y);
    return std::sqrt(x + y) < this->size;
  }

  void State::eat() {
    this->size = std::sqrt(this->size * this->size + 5);
  }
}
