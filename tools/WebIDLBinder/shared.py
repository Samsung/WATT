import os
import shutil

def try_delete(filename):
  try:
    os.unlink(filename)
  except:
    pass
  if not os.path.exists(filename): return
  try:
    shutil.rmtree(filename, ignore_errors=True)
  except:
    pass
  if not os.path.exists(filename): return
  try:
    os.chmod(filename, os.stat(filename).st_mode | stat.S_IWRITE)
    def remove_readonly_and_try_again(func, path, exc_info):
      if not (os.stat(path).st_mode & stat.S_IWRITE):
        os.chmod(path, os.stat(path).st_mode | stat.S_IWRITE)
        func(path)
      else:
        raise
    shutil.rmtree(filename, onerror=remove_readonly_and_try_again)
  except:
    pass

__rootpath__ = os.path.abspath(os.path.dirname(__file__))
def path_from_root(*pathelems):
  return os.path.join(__rootpath__, *pathelems)

