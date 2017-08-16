#include <string>

class Matrix {
public:
    Matrix();

    char* ToString();
    void move(float x, float y);
    void moveTo(float x, float y);
    void scale(float width, float height);
    void scaleTo(float width, float height);
    void rotateX(float degree);
    void rotateY(float degree);
    void rotateZ(float degree);
private:
    static void multiply(float* lVal, float* rVal);
    std::string strValue;
    float degreeValue;
    float scaleWidth, scaleHeight;
    float cx, cy;
    float dX, dY, dZ;
};
