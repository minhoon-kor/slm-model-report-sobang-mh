import tkinter as tk
from tkinter import messagebox

def click(key):
    if key == '=':
        try:
            result = eval(display.get())
            display.delete(0, tk.END)
            display.insert(tk.END, str(result))
        except:
            messagebox.showerror("오류", "잘못된 수식입니다")
    elif key == 'C':
        display.delete(0, tk.END)
    else:
        display.insert(tk.END, key)

root = tk.Tk()
root.title("계산기")
root.geometry("300x400")

display = tk.Entry(root, font=('Arial', 24), justify='right')
display.pack(fill=tk.BOTH, padx=10, pady=10)

buttons = [
    '7', '8', '9', '/',
    '4', '5', '6', '*',
    '1', '2', '3', '-',
    'C', '0', '=', '+'
]

frame = tk.Frame(root)
frame.pack()

row, col = 0, 0
for btn in buttons:
    tk.Button(frame, text=btn, font=('Arial', 18), width=4, height=2,
              command=lambda b=btn: click(b)).grid(row=row, column=col, padx=5, pady=5)
    col += 1
    if col > 3:
        col = 0
        row += 1

root.mainloop()