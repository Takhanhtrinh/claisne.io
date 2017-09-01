#include <math.h>
#include <iostream>
#include <uWS/uWS.h>

#include "json.hpp"

using json = nlohmann::json;

const int FOOD_MAX = 100;
const int X_MAX = 1920;
const int Y_MAX = 1080;
const int REPEAT_MS = 40;
const int START_SIZE = 10;

struct Vector {
  float x;
  float y;

  Vector() : x(0.), y(0.) {}
  Vector(float x, float y) : x(y), y(y) { }
  Vector(const Vector& v) : x(v.y), y(v.y) { }
  static Vector Random() { return Vector(std::rand() % X_MAX, std::rand() % Y_MAX); }

  float length() {
    return std::sqrt(std::pow(x, 2) + std::pow(y, 2));
  }
};

Vector operator/(const Vector& v, float f) { return Vector(v.x / f, v.y / f); }
Vector operator-(const Vector& l, const Vector& r) { return Vector(l.x - r.x, l.y - r.y); }

struct State {
  int id;
  float size;
  Vector p;
  Vector t;

  State(int id, const Vector &p) : id(id), p(p), size(START_SIZE) {};

  void set_target(const Vector &p) { this->p = p; }

  void update(int dt) {
    Vector pt = (p - t) / 100;
    p.x += pt.x;
    p.y += pt.y;
  }
};

void to_json(json &j, const State *s) {
  j = json{
    {"id", s->id},
    {"x", s->p.x},
    {"y", s->p.y},
    {"s", s->size}
  };
}

int main() {
  uWS::Hub hub;
  int next_id = 0;

  hub.onConnection([&next_id](uWS::WebSocket<uWS::SERVER> *ws, uWS::HttpRequest req) {
    int id = next_id++;
    ws->setUserData(new State(id, Vector::Random()));

    json j = {{"id", id}};
    std::string js = j.dump();
    ws->send(js.c_str(), uWS::TEXT);
  });

  hub.onMessage([](uWS::WebSocket<uWS::SERVER> *ws, char *message, size_t length, uWS::OpCode opCode) {
  });

  hub.onDisconnection([](uWS::WebSocket<uWS::SERVER> *ws, int code, char *message, size_t length) {
  });

  Timer *timer = new Timer(hub.getLoop());
  timer->setData((void*) &hub);
  timer->start([](Timer *timer) {
    uWS::Hub *h = (uWS::Hub*)timer->getData(); 

    std::vector<State*> states;
    h->getDefaultGroup<uWS::SERVER>().forEach([&states](uWS::WebSocket<uWS::SERVER> *ws) {
      State *state = (State *) ws->getUserData();
      states.push_back(state);
    });

    int timestamp =
      std::chrono::duration_cast<std::chrono::milliseconds>
        (std::chrono::system_clock::now().time_since_epoch()).count();
 
    json j = {{"states", states}, {"timestamp", timestamp}};
    std::string jd = j.dump();
    h->getDefaultGroup<uWS::SERVER>().broadcast(jd.c_str(), jd.size(), uWS::TEXT);
  }, 0, REPEAT_MS);

  hub.listen(3000);
  hub.run();
}
