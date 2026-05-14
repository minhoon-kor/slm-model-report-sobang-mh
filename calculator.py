def calculator():
    print("간단한 계산기")
    print("------------")
    print("사칙연산: +, -, *, /")
    print("종료: q")

    while True:
        expr = input("\n수식 입력 (예: 2 + 3): ")
        if expr.lower() == 'q':
            break

        try:
            result = eval(expr)
            print(f"결과: {result}")
        except Exception as e:
            print(f"오류: {e}")

calculator()