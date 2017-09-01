#include <math.h>
#include "json.hpp"

using json = nlohmann::json;

namespace iogame {
  struct Food {
    int x;
    int y;
  };

  class State {
  private:
  public:
    State(int id, float x, float y);
    void update_position(int dt);
    void set_position_target(int x, int y);
    void eat();
    bool is_eating(Food &food);

    int id;
    float x;
    float y;
    float size = 10.0;
    int target_x = 0;
    int target_y = 0;
  };
}
