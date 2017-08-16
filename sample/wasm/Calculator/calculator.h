#include <string>

class Calculator
{
public:
    Calculator(int initialValue);

    bool setOperand(int value);
    bool setOperator(std::string op);

    int getResult();
private:
    static const char* supportOperators[];

    enum OPERATOR {
        Plus = 0
        , Minus
        , Multiply
        , Divide
        , NotSupport
    };

    static OPERATOR getOperatorEnum(std::string op);

    bool isSupportedOperator(std::string op);

    enum State {
        Operand = 0
        , Operator
    };

    State state;
    int currentValue;
    OPERATOR currentOp;
};
