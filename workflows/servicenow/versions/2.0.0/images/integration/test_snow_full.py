import pytest
import re
from unittest import mock
from unittest.mock import MagicMock, mock_open
import json
from snow import *

def test_getBaseUrl():
    assert getBaseUrl("https://example.com") == "https://example.com/api"

@mock.patch("builtins.open", new_callable=mock_open)
def test_exportVariable(mock_file):
    exportVariable("VAR", "value")
    mock_file.assert_called_once_with("/tmp/VAR", "w")
    mock_file().write.assert_called_once_with("value")

@mock.patch("builtins.open", new_callable=mock_open, read_data="line1\nline2\n")
def test_replace_first_line(mock_file):
    replace_first_line("dummy.txt", "new_line\n")
    mock_file().writelines.assert_called_once_with(["new_line\n", "line2\n"])

def test_processCallbackResponse_logs_error(caplog):
    response = MagicMock()
    response.status_code = 500
    response.text = "Error"
    with caplog.at_level("ERROR"):
        with pytest.raises(SystemExit) as exc:
            processCallbackResponse(response)
    assert "Callback creation failed" in caplog.text
    assert exc.value.code == 500

def test_processCallbackResponse_logs_debug(caplog):
    response = MagicMock()
    response.status_code = 200
    response.text = "Success"
    with caplog.at_level("DEBUG"):
        processCallbackResponse(response)
    assert "Callback creation successful" in caplog.text

def test_checkSysid_empty():
    with mock.patch("sys.exit") as mock_exit:
        checkSysid(None)
        mock_exit.assert_called_once()

def test_checkSysid_valid():
    with mock.patch("sys.exit") as mock_exit:
        checkSysid("abc")
        mock_exit.assert_not_called()

def test_checkToken_empty():
    with mock.patch("sys.exit") as mock_exit:
        checkToken(None)
        mock_exit.assert_called_once()

def test_checkToken_valid():
    with mock.patch("sys.exit") as mock_exit:
        checkToken("token")
        mock_exit.assert_not_called()

def test_checkUser_empty():
    with mock.patch("sys.exit") as mock_exit:
        checkUser(None)
        mock_exit.assert_called_once()

def test_checkUser_valid():
    with mock.patch("sys.exit") as mock_exit:
        checkUser("user")
        mock_exit.assert_not_called()

def test_checkConflictPolicy_valid():
    with mock.patch("sys.exit") as mock_exit:
        checkConflictPolicy("ignore")
        mock_exit.assert_not_called()

def test_checkConflictPolicy_invalid():
    with pytest.raises(SystemExit):
        checkConflictPolicy("invalid")

@mock.patch("snow.requests.post")
def test_createChangeRequest(mock_post):
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {"result": {"number": {"value": "CHG001"}, "sys_id": {"value": "CHG123"}}}
    mock_post.return_value = mock_response
    createChangeRequest("url", "token", "user", json.dumps({"data": "test"}))

@mock.patch("snow.requests.get")
@mock.patch("snow.requests.post")
def test_createStandardChangeRequest(mock_post, mock_get):
    mock_get_response = MagicMock()
    mock_get_response.status_code = 200
    mock_get_response.json.return_value = {"result": [{"sys_id": "STD123"}]}
    mock_get.return_value = mock_get_response

    mock_post_response = MagicMock()
    mock_post_response.status_code = 200
    mock_post_response.json.return_value = {"result": [{"number": {"value": "STD001"}, "sys_id": {"value": "STD123"}}]}
    mock_post.return_value = mock_post_response

    createStandardChangeRequest("url", "token", "https://example.com/template", '{"short_description": "test"}', "standardName")

@mock.patch("snow.requests.get")
def test_queryChangeRequest(mock_get):
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {"result": {"number": "CHG001"}}
    mock_get.return_value = mock_response
    queryChangeRequest("url", "token", "sysid", "user")

@mock.patch("requests.get")
def test_queryChangeRequestTask(mock_get):
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {"result": {"task": "task"}}
    mock_get.return_value = mock_response
    queryChangeRequestTask("url", "token", "sysid", "user")

@mock.patch("snow.requests.patch")
def test_updateChangeRequest(mock_patch):
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {"result": {"status": "ok"}}
    mock_patch.return_value = mock_response
    updateChangeRequest("user", "password", "baseUrl", "sysid", '{"json":"data"}')

@mock.patch("requests.post")
def test_callback_timeout(mock_post):
    mock_post.side_effect = requests.exceptions.Timeout
    with pytest.raises(requests.exceptions.Timeout):
        callback("url", "base", "number", "cfid", "token", "abort", "squash")

@mock.patch("requests.post")
def test_callback_invalid_token(mock_post):
    mock_response = MagicMock()
    mock_response.status_code = 401
    mock_response.text = "Unauthorized"
    mock_post.return_value = mock_response
    with pytest.raises(SystemExit):
        callback("url", "base", "number", "cfid", "invalid_token", "abort", "merge")

@mock.patch("requests.post")
def test_callback_connection_error(mock_post):
    mock_post.side_effect = requests.exceptions.ConnectionError("Network down")
    with pytest.raises(requests.exceptions.ConnectionError):
        callback("url", "base", "number", "cfid", "token", "ignore", "merge")

@mock.patch("requests.post")
def test_callback_non_200(mock_post):
    mock_response = MagicMock()
    mock_response.status_code = 500
    mock_response.text = "Internal Error"
    mock_post.return_value = mock_response
    with pytest.raises(SystemExit):
        callback("url", "base", "number", "cfid", "token", "ignore", "merge")

@mock.patch("sys.exit")
def test_checkConflictPolicy_abort(mock_exit):
    checkConflictPolicy("abort")
    mock_exit.assert_called()

@mock.patch("requests.post")
def test_createChangeRequest_bad_response(mock_post):
    mock_response = MagicMock()
    mock_response.status_code = 403
    mock_response.text = "Forbidden"
    mock_post.return_value = mock_response
    with pytest.raises(SystemExit):
        createChangeRequest("url", "token", "user", json.dumps({"data": "test"}))
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_post.return_value = mock_response
    callback("url", "base", "number", "cfid", "token", "ignore", "merge")

@mock.patch("requests.post")
def test_processCallbackResponse_success(mock_post):
    from snow import processCallbackResponse
    response = MagicMock(status_code=200)
    # Should not raise SystemExit
    processCallbackResponse(response)

@mock.patch("requests.post")
def test_processCallbackResponse_error(mock_post):
    from snow import processCallbackResponse
    response = MagicMock(status_code=500, text="oops")
    with pytest.raises(SystemExit) as exc:
        processCallbackResponse(response)
    assert exc.value.code == 500

def test_processQueryChangeRequestResponse_success():
    from snow import processQueryChangeRequestResponse
    response = MagicMock(status_code=200)
    response.json.return_value = {"hello": "world"}
    assert processQueryChangeRequestResponse(response) == {"hello": "world"}

def test_processQueryChangeRequestResponse_error():
    from snow import processQueryChangeRequestResponse
    response = MagicMock(status_code=404, text="not found")
    response.json.return_value = {}
    with pytest.raises(SystemExit) as exc:
        processQueryChangeRequestResponse(response)
    assert exc.value.code == 404

@mock.patch("snow.exportVariable")
def test_processModifyChangeRequestResponse_actions(mock_export):
    from snow import processModifyChangeRequestResponse
    resp = MagicMock(status_code=200)
    resp.json.return_value = {"k": "v"}
    # update branch
    processModifyChangeRequestResponse(resp, "update")
    mock_export.assert_any_call("CR_UPDATE_JSON", json.dumps({"k": "v"}, indent=2))
    # close branch
    processModifyChangeRequestResponse(resp, "close")
    mock_export.assert_any_call("CR_CLOSE_JSON", json.dumps({"k": "v"}, indent=2))

@mock.patch("requests.patch")
@mock.patch("snow.processModifyChangeRequestResponse")
def test_closeChangeRequest_calls_patch_and_process(mock_process, mock_patch):
    from snow import closeChangeRequest
    # with some JSON data
    closeChangeRequest("u", "p", "https://base/", "SYS1", "CODE", "notes", json.dumps({"a": 1}))
    mock_patch.assert_called_once()
    mock_process.assert_called_once()

@mock.patch("requests.get")
def test_processSearchStandardTemplateResponse_not_found(mock_get):
    from snow import processSearchStandardTemplateResponse
    response = MagicMock(status_code=200)
    response.json.return_value = {"result": []}
    with pytest.raises(SystemExit):
        processSearchStandardTemplateResponse("tmpl", response)

@mock.patch("requests.get")
def test_processSearchStandardTemplateResponse_success(mock_get):
    from snow import processSearchStandardTemplateResponse
    response = MagicMock(status_code=200)
    response.json.return_value = {"result": [{"sys_id": "XYZ"}]}
    sid = processSearchStandardTemplateResponse("tmpl", response)
    assert sid == "XYZ"

@mock.patch("requests.post")
def test_callback_happy_path(mock_post):
    from snow import callback
    # simulate CF_URL and CF_RUNTIME env vars
    monkey_env = {"CF_URL": "http://ci", "CF_RUNTIME": "r"}
    monkeypatch = pytest.MonkeyPatch()
    monkeypatch.setenv("CF_URL", "http://ci")
    monkeypatch.setenv("CF_RUNTIME", "r")
    mock_post.return_value = MagicMock(status_code=200)
    # Should not raise
    callback("u", "p", "https://base", "123", "cfid", "token", "ignore")
    monkeypatch.undo()

@mock.patch("snow.exportVariable")
def test_processCreateChangeRequestResponse_success(mock_export):
    from snow import processCreateChangeRequestResponse
    response = MagicMock(status_code=201)
    response.json.return_value = {
        "result": {
            "number": {"value": "456"},
            "sys_id": {"value": "sid456"}
        }
    }
    result = processCreateChangeRequestResponse(response)
    assert result == "456"
    mock_export.assert_any_call("CR_NUMBER", "456")
    mock_export.assert_any_call("CR_SYSID", "sid456")

def test_processCreateChangeRequestResponse_error():
    from snow import processCreateChangeRequestResponse
    response = MagicMock(status_code=400, text="Bad things")
    with pytest.raises(SystemExit) as exc:
        processCreateChangeRequestResponse(response)
    assert exc.value.code == 400

def test_processSearchStandardTemplateResponse_error_status():
    from snow import processSearchStandardTemplateResponse
    response = MagicMock(status_code=500, text="Server boom")
    with pytest.raises(SystemExit) as exc:
        processSearchStandardTemplateResponse("tmpl", response)
    assert exc.value.code == 500

@mock.patch("snow.processModifyChangeRequestResponse")
@mock.patch("snow.requests.patch")
def test_updateChangeRequest_empty_data(patch_mock, process_mock, caplog):
    from snow import updateChangeRequest
    with caplog.at_level("WARNING"):
        updateChangeRequest("user", "pass", "https://api", "SYSID", "")
    patch_mock.assert_called_once()
    process_mock.assert_called_once()
    assert "CR_DATA is empty" in caplog.text

def test_processQueryChangeRequestResponse_status_201():
    from snow import processQueryChangeRequestResponse
    response = MagicMock(status_code=201)
    response.json.return_value = {"result": {"state": {"display_value": "OK"}}}
    assert processQueryChangeRequestResponse(response) == {"result": {"state": {"display_value": "OK"}}}

def test_checkConflictPolicy_valid():
    from snow import checkConflictPolicy
    for policy in ("ignore", "reject", "wait"):
        # should not raise
        checkConflictPolicy(policy)

def test_watchChangeRequestState_resume(monkeypatch, tmp_path):
    import snow

    # stub out the CR query to immediately return the resume_state
    monkeypatch.setattr(snow, "queryChangeRequest", 
                        lambda u, p, b, sid: {"result": {"state": {"display_value": "RESUMED"}}})

    # fake time so elapsed never exceeds timeout
    times = [100.0, 100.0]  # start_time, then time() when checking elapsed
    def fake_time():
        return times.pop(0)
    class FakeTimeModule:
        time = staticmethod(fake_time)
        sleep = staticmethod(lambda s: None)
    monkeypatch.setattr(snow, "time", FakeTimeModule)

    progress_file = tmp_path / "progress.txt"
    # the signature is (user, password, baseUrl, sysid, timeout, sleep_interval, resume_state, cancel_state, progress_file, task_name)
    with pytest.raises(SystemExit) as exc:
        snow.watchChangeRequestState(
            "u", "p", "https://svc", "CR123",
            "10", "1",
            "RESUMED", "CANCELLED",
            str(progress_file),  # argo_progress_file
            ""                  # no task_name => CR branch
        )
    # should exit with code 0 on resume
    assert exc.value.code == 0

    # the progress file should have been initialized to "0/10"
    assert progress_file.read_text() == "0/10"


def test_watchChangeRequestState_cancel(monkeypatch, tmp_path):
    import snow

    # stub out CR query to immediately return the cancel_state
    monkeypatch.setattr(snow, "queryChangeRequest", 
                        lambda u, p, b, sid: {"result": {"state": {"display_value": "CANCELLED"}}})

    # time not critical here; we exit before checking elapsed
    class FakeTimeModule:
        time = staticmethod(lambda: 0)
        sleep = staticmethod(lambda s: None)
    monkeypatch.setattr(snow, "time", FakeTimeModule)

    progress_file = tmp_path / "progress.txt"
    with pytest.raises(SystemExit) as exc:
        snow.watchChangeRequestState(
            "u", "p", "https://svc", "CR123",
            "5", "1",
            "RESUMED", "CANCELLED",
            str(progress_file),
            ""
        )
    # should exit with code 1 on cancel
    assert exc.value.code == 1


def test_watchChangeRequestState_task_branch(monkeypatch, tmp_path):
    import snow

    # stub out the task query to immediately return one matching task in "RESUMED" state
    def fake_query_task(u, p, b, sid):
        return {
            "result": [
                {
                    "short_description": {"display_value": "MyTask"},
                    "state": {"display_value": "RESUMED"}
                }
            ]
        }
    monkeypatch.setattr(snow, "queryChangeRequestTask", fake_query_task)

    # fake time so we never hit the timeout
    class FakeTimeModule:
        time = staticmethod(lambda: 42.0)
        sleep = staticmethod(lambda s: None)
    monkeypatch.setattr(snow, "time", FakeTimeModule)

    progress_file = tmp_path / "progress.txt"
    with pytest.raises(SystemExit) as exc:
        snow.watchChangeRequestState(
            "u", "p", "https://svc", "CR123",
            "15", "2",
            "RESUMED", "CANCELLED",
            str(progress_file),
            "MyTask"  # non-empty => task branch
        )
    assert exc.value.code == 0
    # and the progress file should exist
    assert progress_file.exists()